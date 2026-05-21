-- Migration：套用到已存在的資料庫
-- 執行方式：psql $DATABASE_URL -f backend/db/migrate.sql

-- 1. 更新 student_activities.status CHECK constraint
ALTER TABLE student_activities
  DROP CONSTRAINT IF EXISTS student_activities_status_check;

ALTER TABLE student_activities
  ADD CONSTRAINT student_activities_status_check
  CHECK (status IN ('pending', 'reading', 'notes', 'reasoning',
                    'argumentation', 'ainotes', 'reflection', 'review',
                    'completed'));

-- 2. 讓 openai_conversation_id 可為 null（init 時尚未建立 OpenAI 對話）
ALTER TABLE ai_conversations ALTER COLUMN openai_conversation_id DROP NOT NULL;
ALTER TABLE ai_messages     ALTER COLUMN openai_conversation_id DROP NOT NULL;

-- 3. 新增 ai_conversations（已存在則跳過）
CREATE TABLE IF NOT EXISTS ai_conversations (
  id                     SERIAL      PRIMARY KEY,
  openai_conversation_id VARCHAR(64) UNIQUE,
  user_id                INTEGER     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  scenario_id            INTEGER     NOT NULL REFERENCES scenarios(id),
  surface                VARCHAR(20) NOT NULL CHECK (surface IN ('argumentation', 'reflection')),
  prompt_id              VARCHAR(64),
  last_response_id       VARCHAR(64),
  created_at             TIMESTAMPTZ DEFAULT NOW(),
  updated_at             TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, scenario_id, surface)
);

-- 4. 新增 review_reasoning_submissions（已存在則跳過）
CREATE TABLE IF NOT EXISTS review_reasoning_submissions (
  id          SERIAL     PRIMARY KEY,
  user_id     INTEGER    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  scenario_id INTEGER    NOT NULL REFERENCES scenarios(id),
  stance      VARCHAR(10) CHECK (stance IN ('贊成', '不贊成')),
  agree_level INTEGER    CHECK (agree_level BETWEEN 1 AND 6),
  args        JSONB,
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, scenario_id)
);

-- 5. 新增 ai_messages（已存在則跳過）
CREATE TABLE IF NOT EXISTS ai_messages (
  id                     SERIAL      PRIMARY KEY,
  openai_conversation_id VARCHAR(64),
  user_id                INTEGER     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  scenario_id            INTEGER     NOT NULL REFERENCES scenarios(id),
  surface                VARCHAR(20) NOT NULL,
  role                   VARCHAR(10) NOT NULL CHECK (role IN ('user', 'assistant')),
  content                TEXT        NOT NULL,
  response_id            VARCHAR(64),
  created_at             TIMESTAMPTZ DEFAULT NOW()
);

-- 6. 班級層級設定：階段鎖定 + 推理挑戰預設開放狀態
CREATE TABLE IF NOT EXISTS class_settings (
  class              VARCHAR(20)  NOT NULL,
  scenario_id        INTEGER      NOT NULL REFERENCES scenarios(id),
  allowed_phase      VARCHAR(20)  NOT NULL DEFAULT 'reading'
    CHECK (allowed_phase IN (
      'reading','reasoning','argumentation',
      'ainotes','reflection','review','completed'
    )),
  reasoning_editable BOOLEAN      NOT NULL DEFAULT true,
  updated_at         TIMESTAMPTZ  DEFAULT NOW(),
  PRIMARY KEY (class, scenario_id)
);

-- 7. 個人推理挑戰覆蓋：NULL=跟班級走，true=強制開放，false=強制鎖定
CREATE TABLE IF NOT EXISTS student_restrictions (
  user_id            INTEGER  NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  scenario_id        INTEGER  NOT NULL REFERENCES scenarios(id),
  reasoning_override BOOLEAN  DEFAULT NULL,
  PRIMARY KEY (user_id, scenario_id)
);
