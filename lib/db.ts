import { Pool } from "pg"

declare global {
  var postgresPool: Pool | undefined
  var appSchemaReady: Promise<void> | undefined
}

export function getDbPool() {
  const connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    throw new Error("DATABASE_URL is not set")
  }

  if (!globalThis.postgresPool) {
    globalThis.postgresPool = new Pool({
      connectionString,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
      ssl:
        process.env.NODE_ENV === "production"
          ? { rejectUnauthorized: false }
          : undefined,
    })
  }

  return globalThis.postgresPool
}

export async function ensureAppSchema() {
  if (!globalThis.appSchemaReady) {
    const pool = getDbPool()
    globalThis.appSchemaReady = (async () => {
      await pool.query(`
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

        CREATE TABLE IF NOT EXISTS discord_threads (
          "conversationId" INTEGER PRIMARY KEY REFERENCES conversations(id) ON DELETE CASCADE,
          "threadId" TEXT NOT NULL UNIQUE,
          "guildId" TEXT NOT NULL,
          "channelId" TEXT NOT NULL,
          "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS messages_conversation_id_idx ON messages("conversationId");
        CREATE INDEX IF NOT EXISTS conversations_last_message_at_idx ON conversations("lastMessageAt");
        CREATE INDEX IF NOT EXISTS discord_threads_thread_id_idx ON discord_threads("threadId");
      `)
    })().catch((error) => {
      globalThis.appSchemaReady = undefined
      throw error
    })
  }

  await globalThis.appSchemaReady
}
