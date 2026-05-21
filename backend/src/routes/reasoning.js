const express        = require('express');
const pool           = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// GET /reasoning/:scenarioId
router.get('/:scenarioId', authMiddleware, async (req, res) => {
  const scenarioId = parseInt(req.params.scenarioId, 10);
  try {
    const result = await pool.query(
      `SELECT stance, agree_level AS "agreeLevel", args
       FROM reasoning_submissions
       WHERE user_id = $1 AND scenario_id = $2`,
      [req.user.id, scenarioId]
    );
    res.json({ submission: result.rows[0] ?? null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

// POST /reasoning/:scenarioId — upsert
router.post('/:scenarioId', authMiddleware, async (req, res) => {
  const scenarioId = parseInt(req.params.scenarioId, 10);
  const { stance, agreeLevel, args } = req.body;

  if (!['贊成', '不贊成'].includes(stance)) {
    return res.status(400).json({ error: 'stance 必須是「贊成」或「不贊成」' });
  }
  if (!Number.isInteger(agreeLevel) || agreeLevel < 1 || agreeLevel > 6) {
    return res.status(400).json({ error: 'agreeLevel 必須是 1–6 的整數' });
  }
  if (!Array.isArray(args)) {
    return res.status(400).json({ error: 'args 必須是陣列' });
  }

  try {
    // 檢查學生是否被鎖定（班級預設 + 個人覆蓋）
    const lockCheck = await pool.query(
      `SELECT COALESCE(sr.reasoning_override, COALESCE(cs.reasoning_editable, true)) AS can_edit
       FROM users u
       LEFT JOIN class_settings cs ON cs.class = u.class AND cs.scenario_id = $2
       LEFT JOIN student_restrictions sr ON sr.user_id = u.id AND sr.scenario_id = $2
       WHERE u.id = $1`,
      [req.user.id, scenarioId]
    );
    if (lockCheck.rows[0]?.can_edit === false) {
      return res.status(403).json({ error: '教師已鎖定推理挑戰，無法修改' });
    }

    await pool.query(
      `INSERT INTO reasoning_submissions (user_id, scenario_id, stance, agree_level, args, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       ON CONFLICT (user_id, scenario_id) DO UPDATE
         SET stance      = EXCLUDED.stance,
             agree_level = EXCLUDED.agree_level,
             args        = EXCLUDED.args,
             updated_at  = NOW()`,
      [req.user.id, scenarioId, stance, agreeLevel, JSON.stringify(args)]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

module.exports = router;
