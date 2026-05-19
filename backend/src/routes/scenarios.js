const express        = require('express');
const pool           = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

const VALID_STATUSES = ['pending', 'reading', 'notes', 'reasoning', 'completed'];

// GET /scenarios — active scenarios with current user's activity status
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.id, s.title, s.created_at,
              sa.status, sa.started_at, sa.completed_at
       FROM scenarios s
       LEFT JOIN student_activities sa
         ON s.id = sa.scenario_id AND sa.user_id = $1
       WHERE s.is_active = true
       ORDER BY s.created_at`,
      [req.user.id]
    );
    res.json({ scenarios: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

// PATCH /scenarios/:id/activity — upsert student_activities status
router.patch('/:id/activity', authMiddleware, async (req, res) => {
  const { status } = req.body;
  const scenarioId = parseInt(req.params.id, 10);

  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: '無效的 status 值' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO student_activities (user_id, scenario_id, status, started_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (user_id, scenario_id) DO UPDATE
         SET status       = EXCLUDED.status,
             completed_at = CASE WHEN EXCLUDED.status = 'completed' THEN NOW()
                                 ELSE student_activities.completed_at END
       RETURNING *`,
      [req.user.id, scenarioId, status]
    );
    res.json({ activity: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

module.exports = router;
