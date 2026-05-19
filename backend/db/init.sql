-- ── users ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL       PRIMARY KEY,
  name          VARCHAR(50)  NOT NULL,
  account       VARCHAR(50)  UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  class         VARCHAR(20),
  seat_number   INTEGER,
  student_id    VARCHAR(20),
  role          VARCHAR(10)  NOT NULL CHECK (role IN ('student', 'teacher')),
  group_type    VARCHAR(20)  CHECK (group_type IN ('experimental', 'control')),
  created_at    TIMESTAMPTZ  DEFAULT NOW()
);

-- ── scenarios ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS scenarios (
  id         SERIAL       PRIMARY KEY,
  title      VARCHAR(255) NOT NULL,
  is_active  BOOLEAN      DEFAULT true,
  created_at TIMESTAMPTZ  DEFAULT NOW()
);

-- ── student_activities ────────────────────────────────────────
-- 記錄每個學生在每個議題的進度狀態
CREATE TABLE IF NOT EXISTS student_activities (
  id           SERIAL      PRIMARY KEY,
  user_id      INTEGER     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  scenario_id  INTEGER     NOT NULL REFERENCES scenarios(id),
  status       VARCHAR(20) NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending', 'reading', 'notes', 'reasoning', 'completed')),
  started_at   TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  UNIQUE (user_id, scenario_id)
);

-- ── reading_notes ─────────────────────────────────────────────
-- 每個學生每個議題一筆，存最新版本
CREATE TABLE IF NOT EXISTS reading_notes (
  id          SERIAL      PRIMARY KEY,
  user_id     INTEGER     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  scenario_id INTEGER     NOT NULL REFERENCES scenarios(id),
  content     TEXT,
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, scenario_id)
);

-- ── reasoning_submissions ─────────────────────────────────────
-- Q1 stance、Q2 agree_level、Q3-Q5 完整樹狀結構存 JSONB
CREATE TABLE IF NOT EXISTS reasoning_submissions (
  id          SERIAL     PRIMARY KEY,
  user_id     INTEGER    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  scenario_id INTEGER    NOT NULL REFERENCES scenarios(id),
  stance      VARCHAR(10) CHECK (stance IN ('贊成', '不贊成')),
  agree_level INTEGER    CHECK (agree_level BETWEEN 1 AND 6),
  args        JSONB,
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, scenario_id)
);
