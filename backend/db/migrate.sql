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
  openai_conversation_id VARCHAR(64) UNIQUE NOT NULL,
  user_id                INTEGER     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  scenario_id            INTEGER     NOT NULL REFERENCES scenarios(id),
  surface                VARCHAR(20) NOT NULL CHECK (surface IN ('argumentation', 'reflection')),
  prompt_id              VARCHAR(64),
  last_response_id       VARCHAR(64),
  created_at             TIMESTAMPTZ DEFAULT NOW(),
  updated_at             TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, scenario_id, surface)
);

-- 4. 新增 ai_messages（已存在則跳過）
CREATE TABLE IF NOT EXISTS ai_messages (
  id                     SERIAL      PRIMARY KEY,
  openai_conversation_id VARCHAR(64) NOT NULL,
  user_id                INTEGER     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  scenario_id            INTEGER     NOT NULL REFERENCES scenarios(id),
  surface                VARCHAR(20) NOT NULL,
  role                   VARCHAR(10) NOT NULL CHECK (role IN ('user', 'assistant')),
  content                TEXT        NOT NULL,
  response_id            VARCHAR(64),
  created_at             TIMESTAMPTZ DEFAULT NOW()
);
