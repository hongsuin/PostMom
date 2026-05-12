-- 채팅 세션 (대화 하나 = 세션 하나)
CREATE TABLE IF NOT EXISTS chat_sessions (
  id        SERIAL PRIMARY KEY,
  user_id   UUID NOT NULL,
  title     TEXT NOT NULL DEFAULT '새 상담',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 세션 안의 메시지들
CREATE TABLE IF NOT EXISTS chat_messages (
  id         SERIAL PRIMARY KEY,
  session_id INTEGER NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role       TEXT NOT NULL CHECK (role IN ('user', 'bot')),
  content    TEXT NOT NULL,
  sources    JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
