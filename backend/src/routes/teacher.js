const express        = require('express');
const pool           = require('../db');
const authMiddleware = require('../middleware/auth');
const requireTeacher = require('../middleware/requireTeacher');

const router = express.Router();
router.use(authMiddleware, requireTeacher);

// GET /teacher/classes?scenario_id=X
// 取得所有班級，及該議題的班級設定
router.get('/classes', async (req, res) => {
  const scenarioId = parseInt(req.query.scenario_id, 10);
  if (!scenarioId) return res.status(400).json({ error: '缺少 scenario_id' });

  try {
    const result = await pool.query(
      `SELECT DISTINCT u.class,
              COALESCE(cs.allowed_phase, 'reading')   AS allowed_phase,
              COALESCE(cs.reasoning_editable, true)   AS reasoning_editable
       FROM users u
       LEFT JOIN class_settings cs
         ON cs.class = u.class AND cs.scenario_id = $1
       WHERE u.class IS NOT NULL AND u.role = 'student'
       ORDER BY u.class`,
      [scenarioId]
    );
    res.json({ classes: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

// PUT /teacher/settings
// 更新班級的階段鎖定或推理挑戰開放狀態
// body: { class, scenario_id, allowed_phase?, reasoning_editable? }
router.put('/settings', async (req, res) => {
  const { class: cls, scenario_id, allowed_phase, reasoning_editable } = req.body;
  if (!cls || !scenario_id) return res.status(400).json({ error: '缺少必要欄位' });
  if (allowed_phase === undefined && reasoning_editable === undefined) {
    return res.status(400).json({ error: '沒有要更新的欄位' });
  }

  try {
    // 先 upsert 確保資料列存在
    await pool.query(
      `INSERT INTO class_settings (class, scenario_id, allowed_phase, reasoning_editable)
       VALUES ($1, $2, 'reading', true)
       ON CONFLICT (class, scenario_id) DO NOTHING`,
      [cls, scenario_id]
    );

    if (allowed_phase !== undefined) {
      await pool.query(
        `UPDATE class_settings SET allowed_phase = $3, updated_at = NOW()
         WHERE class = $1 AND scenario_id = $2`,
        [cls, scenario_id, allowed_phase]
      );
    }
    if (reasoning_editable !== undefined) {
      await pool.query(
        `UPDATE class_settings SET reasoning_editable = $3, updated_at = NOW()
         WHERE class = $1 AND scenario_id = $2`,
        [cls, scenario_id, reasoning_editable]
      );
    }

    const result = await pool.query(
      `SELECT allowed_phase, reasoning_editable
       FROM class_settings WHERE class = $1 AND scenario_id = $2`,
      [cls, scenario_id]
    );
    res.json({ settings: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

// GET /teacher/students?class=X&scenario_id=Y
// 取得班級學生清單，含目前活動狀態及個人推理挑戰覆蓋設定
router.get('/students', async (req, res) => {
  const { class: cls, scenario_id } = req.query;
  const scenarioId = parseInt(scenario_id, 10);
  if (!cls || !scenarioId) return res.status(400).json({ error: '缺少必要參數' });

  try {
    const result = await pool.query(
      `SELECT u.id, u.name, u.account, u.seat_number,
              COALESCE(sa.status, 'pending') AS current_phase,
              sr.reasoning_override
       FROM users u
       LEFT JOIN student_activities sa
         ON sa.user_id = u.id AND sa.scenario_id = $2
       LEFT JOIN student_restrictions sr
         ON sr.user_id = u.id AND sr.scenario_id = $2
       WHERE u.class = $1 AND u.role = 'student'
       ORDER BY u.seat_number NULLS LAST, u.name`,
      [cls, scenarioId]
    );
    res.json({ students: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

// PUT /teacher/students/:userId/restriction
// 設定個別學生的推理挑戰覆蓋（null=跟班級，true=強制開放，false=強制鎖定）
// body: { scenario_id, reasoning_override: true | false | null }
router.put('/students/:userId/restriction', async (req, res) => {
  const userId    = parseInt(req.params.userId, 10);
  const { scenario_id, reasoning_override } = req.body;
  if (!scenario_id) return res.status(400).json({ error: '缺少 scenario_id' });

  // reasoning_override 可以是 true / false / null
  const override = reasoning_override === null ? null : Boolean(reasoning_override);

  try {
    if (override === null) {
      // 刪除覆蓋記錄，讓學生回到跟班級一樣
      await pool.query(
        `DELETE FROM student_restrictions WHERE user_id = $1 AND scenario_id = $2`,
        [userId, scenario_id]
      );
    } else {
      await pool.query(
        `INSERT INTO student_restrictions (user_id, scenario_id, reasoning_override)
         VALUES ($1, $2, $3)
         ON CONFLICT (user_id, scenario_id) DO UPDATE
           SET reasoning_override = EXCLUDED.reasoning_override`,
        [userId, scenario_id, override]
      );
    }
    res.json({ ok: true, reasoning_override: override });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

module.exports = router;
