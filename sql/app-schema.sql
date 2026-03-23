CREATE TABLE IF NOT EXISTS conversations (
  id SERIAL PRIMARY KEY,
  "userEmail" TEXT NOT NULL UNIQUE,
  "userName" TEXT,
  status VARCHAR(64) NOT NULL DEFAULT 'open',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "lastMessageAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  "conversationId" INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  "senderType" VARCHAR(32) NOT NULL,
  body TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS messages_conversation_id_idx ON messages("conversationId");
CREATE INDEX IF NOT EXISTS conversations_last_message_at_idx ON conversations("lastMessageAt");
