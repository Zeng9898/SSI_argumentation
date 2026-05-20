const express = require('express');
const OpenAI  = require('openai');
const pool    = require('../db');
const auth    = require('../middleware/auth');

const router = express.Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const OPENAI_MODEL         = process.env.OPENAI_MODEL  || 'gpt-4.1-mini';
const REFLECTION_PROMPT_ID = process.env.OPENAI_PROMPT_ID_REFLECTION;

const OPENING_MESSAGE = '回頭看你和 AI 的討論，在開始論證之前，你原本比較偏向什麼立場？';

async function fetchMessages(userId, scenarioId, surface) {
  const { rows } = await pool.query(
    `SELECT id, role, content FROM ai_messages
     WHERE user_id = $1 AND scenario_id = $2 AND surface = $3
     ORDER BY created_at ASC, id ASC`,
    [userId, scenarioId, surface]
  );
  return rows.map((r) => ({
    id:      String(r.id),
    role:    r.role === 'assistant' ? 'ai' : 'user',
    content: r.content,
  }));
}

// POST /ai-reflection/:scenarioId/init — 初始化或還原對話
router.post('/:scenarioId/init', auth, async (req, res) => {
  const scenarioId = parseInt(req.params.scenarioId, 10);
  try {
    const existing = await pool.query(
      `SELECT id FROM ai_conversations
       WHERE user_id = $1 AND scenario_id = $2 AND surface = 'reflection'`,
      [req.user.id, scenarioId]
    );

    if (existing.rows[0]) {
      return res.json({ messages: await fetchMessages(req.user.id, scenarioId, 'reflection') });
    }

    await pool.query(
      `INSERT INTO ai_conversations (user_id, scenario_id, surface)
       VALUES ($1, $2, 'reflection')`,
      [req.user.id, scenarioId]
    );

    const saved = await pool.query(
      `INSERT INTO ai_messages (user_id, scenario_id, surface, role, content)
       VALUES ($1, $2, 'reflection', 'assistant', $3)
       RETURNING id`,
      [req.user.id, scenarioId, OPENING_MESSAGE]
    );

    res.json({
      messages: [{ id: String(saved.rows[0].id), role: 'ai', content: OPENING_MESSAGE }],
    });
  } catch (err) {
    console.error('[POST /ai-reflection/init]', err);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

// GET /ai-reflection/:scenarioId — 取得既有訊息
router.get('/:scenarioId', auth, async (req, res) => {
  const scenarioId = parseInt(req.params.scenarioId, 10);
  try {
    res.json({ messages: await fetchMessages(req.user.id, scenarioId, 'reflection') });
  } catch (err) {
    console.error('[GET /ai-reflection]', err);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

// POST /ai-reflection/:scenarioId — 送出訊息並取得 AI 回覆
router.post('/:scenarioId', auth, async (req, res) => {
  const scenarioId = parseInt(req.params.scenarioId, 10);
  const { userMessage } = req.body;

  if (!userMessage?.trim()) {
    return res.status(400).json({ error: 'userMessage 不能為空' });
  }
  if (!REFLECTION_PROMPT_ID) {
    return res.status(500).json({ error: '找不到 reflection prompt，請確認 .env 設定' });
  }

  try {
    const convRow = await pool.query(
      `SELECT openai_conversation_id FROM ai_conversations
       WHERE user_id = $1 AND scenario_id = $2 AND surface = 'reflection'`,
      [req.user.id, scenarioId]
    );

    let convId = convRow.rows[0]?.openai_conversation_id ?? null;

    if (!convId) {
      const conv = await openai.conversations.create({
        metadata: {
          app:        'ssi_argumentation',
          surface:    'reflection',
          userId:     String(req.user.id),
          scenarioId: String(scenarioId),
          groupType:  req.user.group_type,
        },
      });
      convId = conv.id;

      if (convRow.rows[0]) {
        await pool.query(
          `UPDATE ai_conversations
           SET openai_conversation_id = $1, prompt_id = $2, updated_at = NOW()
           WHERE user_id = $3 AND scenario_id = $4 AND surface = 'reflection'`,
          [convId, REFLECTION_PROMPT_ID, req.user.id, scenarioId]
        );
      } else {
        await pool.query(
          `INSERT INTO ai_conversations
             (openai_conversation_id, user_id, scenario_id, surface, prompt_id)
           VALUES ($1, $2, $3, 'reflection', $4)`,
          [convId, req.user.id, scenarioId, REFLECTION_PROMPT_ID]
        );
      }
    }

    await pool.query(
      `INSERT INTO ai_messages
         (openai_conversation_id, user_id, scenario_id, surface, role, content)
       VALUES ($1, $2, $3, 'reflection', 'user', $4)`,
      [convId, req.user.id, scenarioId, userMessage.trim()]
    );

    const response = await openai.responses.create({
      model:        OPENAI_MODEL,
      prompt:       { id: REFLECTION_PROMPT_ID },
      conversation: convId,
      input:        [{ role: 'user', content: userMessage.trim() }],
      store:        true,
    });

    const assistantMessage = response.output_text ?? '';

    const saved = await pool.query(
      `INSERT INTO ai_messages
         (openai_conversation_id, user_id, scenario_id, surface, role, content, response_id)
       VALUES ($1, $2, $3, 'reflection', 'assistant', $4, $5)
       RETURNING id`,
      [convId, req.user.id, scenarioId, assistantMessage, response.id]
    );

    await pool.query(
      `UPDATE ai_conversations
       SET last_response_id = $1, updated_at = NOW()
       WHERE openai_conversation_id = $2`,
      [response.id, convId]
    );

    res.json({ assistantMessage, messageId: String(saved.rows[0].id) });
  } catch (err) {
    console.error('[POST /ai-reflection]', err);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

module.exports = router;
