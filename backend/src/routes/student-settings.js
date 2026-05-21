const express        = require('express');
const pool           = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// GET /student-settings?scenario_id=Y
// 學生查詢自己的有效權限：allowed_phase + can_edit_reasoning
router.get('/', authMiddleware, async (req, res) => {
  const scenarioId = parseInt(req.query.scenario_id, 10);
  if (!scenarioId) return res.status(400).json({ error: '缺少 scenario_id' });

  try {
    const result = await pool.query(
      `SELECT
         COALESCE(cs.allowed_phase, 'completed')                              AS allowed_phase,
         COALESCE(sr.reasoning_override, COALESCE(cs.reasoning_editable, true)) AS can_edit_reasoning
       FROM users u
       LEFT JOIN class_settings cs
         ON cs.class = u.class AND cs.scenario_id = $2
       LEFT JOIN student_restrictions sr
         ON sr.user_id = u.id AND sr.scenario_id = $2
       WHERE u.id = $1`,
      [req.user.id, scenarioId]
    );

    const row = result.rows[0];
    // 若學生沒有 class，給予最寬鬆的預設值
    if (!row) {
      return res.json({ allowed_phase: 'completed', can_edit_reasoning: true });
    }
    res.json({
      allowed_phase:      row.allowed_phase,
      can_edit_reasoning: row.can_edit_reasoning,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

module.exports = router;
