import { ensureAppSchema, getDbPool } from "@/lib/db"

export type DiscordThreadRecord = {
  conversationId: number
  threadId: string
  guildId: string
  channelId: string
}

export async function getDiscordThreadByConversationId(conversationId: number) {
  await ensureAppSchema()
  const pool = getDbPool()
  const result = await pool.query<DiscordThreadRecord>(
    `SELECT
       "conversationId" AS "conversationId",
       "threadId" AS "threadId",
       "guildId" AS "guildId",
       "channelId" AS "channelId"
     FROM discord_threads
     WHERE "conversationId" = $1
     LIMIT 1`,
    [conversationId]
  )

  return result.rows[0] ?? null
}

export async function getDiscordThreadByThreadId(threadId: string) {
  await ensureAppSchema()
  const pool = getDbPool()
  const result = await pool.query<DiscordThreadRecord>(
    `SELECT
       "conversationId" AS "conversationId",
       "threadId" AS "threadId",
       "guildId" AS "guildId",
       "channelId" AS "channelId"
     FROM discord_threads
     WHERE "threadId" = $1
     LIMIT 1`,
    [threadId]
  )

  return result.rows[0] ?? null
}

export async function upsertDiscordThread(params: DiscordThreadRecord) {
  await ensureAppSchema()
  const pool = getDbPool()

  await pool.query(
    `INSERT INTO discord_threads ("conversationId", "threadId", "guildId", "channelId")
     VALUES ($1, $2, $3, $4)
     ON CONFLICT ("conversationId")
     DO UPDATE SET
       "threadId" = EXCLUDED."threadId",
       "guildId" = EXCLUDED."guildId",
       "channelId" = EXCLUDED."channelId",
       "updatedAt" = NOW()`,
    [params.conversationId, params.threadId, params.guildId, params.channelId]
  )
}
