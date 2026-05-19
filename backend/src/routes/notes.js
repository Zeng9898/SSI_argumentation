const express        = require('express');
const pool           = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// GET /notes/:scenarioId
router.get('/:scenarioId', authMiddleware, async (req, res) => {
  const scenarioId = parseInt(req.params.scenarioId, 10);
  try {
    const result = await pool.query(
      'SELECT content FROM reading_notes WHERE user_id = $1 AND scenario_id = $2',
      [req.user.id, scenarioId]
    );
    const notes = result.rows[0] ? JSON.parse(result.rows[0].content) : [];
    res.json({ notes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

// POST /notes/:scenarioId — upsert full notes array
router.post('/:scenarioId', authMiddleware, async (req, res) => {
  const scenarioId = parseInt(req.params.scenarioId, 10);
  const { notes } = req.body;

  if (!Array.isArray(notes)) {
    return res.status(400).json({ error: 'notes 必須是陣列' });
  }

  try {
    await pool.query(
      `INSERT INTO reading_notes (user_id, scenario_id, content, updated_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (user_id, scenario_id) DO UPDATE
         SET content = EXCLUDED.content, updated_at = NOW()`,
      [req.user.id, scenarioId, JSON.stringify(notes)]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

module.exports = router;
