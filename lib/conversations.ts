import { ensureAppSchema, getDbPool } from "@/lib/db"

export type ConversationSummary = {
  id: number
  userEmail: string
  userName: string | null
  status: string
  lastMessageAt: string
  lastMessageBody: string | null
  messageCount: number
}

export type ConversationMessage = {
  id: number
  conversationId: number
  senderType: "user" | "operator"
  body: string
  createdAt: string
}

export type ConversationRecord = {
  id: number
  userEmail: string
  userName: string | null
  status: string
  createdAt: string
  updatedAt: string
  lastMessageAt: string
}

export async function getOrCreateConversationForUser(
  userEmail: string,
  userName?: string | null
) {
  await ensureAppSchema()
  const pool = getDbPool()

  const existing = await pool.query<ConversationRecord>(
    `SELECT id, "userEmail", "userName", status, "createdAt", "updatedAt", "lastMessageAt"
     FROM conversations
     WHERE "userEmail" = $1
     LIMIT 1`,
    [userEmail]
  )

  if (existing.rowCount) {
    if (userName && existing.rows[0].userName !== userName) {
      await pool.query(
        `UPDATE conversations
         SET "userName" = $2, "updatedAt" = NOW()
         WHERE id = $1`,
        [existing.rows[0].id, userName]
      )
      existing.rows[0].userName = userName
    }
    return existing.rows[0]
  }

  const created = await pool.query<ConversationRecord>(
    `INSERT INTO conversations ("userEmail", "userName")
     VALUES ($1, $2)
     RETURNING id, "userEmail", "userName", status, "createdAt", "updatedAt", "lastMessageAt"`,
    [userEmail, userName ?? null]
  )

  return created.rows[0]
}

export async function listMessagesForConversation(conversationId: number) {
  await ensureAppSchema()
  const pool = getDbPool()
  const result = await pool.query<ConversationMessage>(
    `SELECT
       id,
       "conversationId" AS "conversationId",
       "senderType" AS "senderType",
       body,
       "createdAt" AS "createdAt"
     FROM messages
     WHERE "conversationId" = $1
     ORDER BY "createdAt" ASC, id ASC`,
    [conversationId]
  )

  return result.rows
}

export async function createMessage(
  conversationId: number,
  senderType: "user" | "operator",
  body: string
) {
  await ensureAppSchema()
  const pool = getDbPool()

  const inserted = await pool.query<ConversationMessage>(
    `INSERT INTO messages ("conversationId", "senderType", body)
     VALUES ($1, $2, $3)
     RETURNING
       id,
       "conversationId" AS "conversationId",
       "senderType" AS "senderType",
       body,
       "createdAt" AS "createdAt"`,
    [conversationId, senderType, body]
  )

  const nextStatus = senderType === "user" ? "awaiting_admin" : "awaiting_user"

  await pool.query(
    `UPDATE conversations
     SET
       status = $2,
       "updatedAt" = NOW(),
       "lastMessageAt" = NOW()
     WHERE id = $1`,
    [conversationId, nextStatus]
  )

  return inserted.rows[0]
}

export async function getConversationById(conversationId: number) {
  await ensureAppSchema()
  const pool = getDbPool()
  const result = await pool.query<ConversationRecord>(
    `SELECT id, "userEmail", "userName", status, "createdAt", "updatedAt", "lastMessageAt"
     FROM conversations
     WHERE id = $1
     LIMIT 1`,
    [conversationId]
  )

  return result.rows[0] ?? null
}

export async function getConversationForUser(
  userEmail: string,
  userName?: string | null
) {
  const conversation = await getOrCreateConversationForUser(userEmail, userName)
  const messages = await listMessagesForConversation(conversation.id)

  return { conversation, messages }
}

export async function listConversationsForAdmin() {
  await ensureAppSchema()
  const pool = getDbPool()
  const result = await pool.query<ConversationSummary>(
    `SELECT
       c.id,
       c."userEmail" AS "userEmail",
       c."userName" AS "userName",
       c.status,
       c."lastMessageAt" AS "lastMessageAt",
       (
         SELECT m.body
         FROM messages m
         WHERE m."conversationId" = c.id
         ORDER BY m."createdAt" DESC, m.id DESC
         LIMIT 1
       ) AS "lastMessageBody",
       COUNT(m.id)::int AS "messageCount"
     FROM conversations c
     LEFT JOIN messages m ON m."conversationId" = c.id
     GROUP BY c.id
     ORDER BY c."lastMessageAt" DESC, c.id DESC`
  )

  return result.rows
}

export async function getConversationForAdmin(conversationId: number) {
  await ensureAppSchema()
  const pool = getDbPool()

  const conversationResult = await pool.query<ConversationSummary>(
    `SELECT
       c.id,
       c."userEmail" AS "userEmail",
       c."userName" AS "userName",
       c.status,
       c."lastMessageAt" AS "lastMessageAt",
       (
         SELECT m.body
         FROM messages m
         WHERE m."conversationId" = c.id
         ORDER BY m."createdAt" DESC, m.id DESC
         LIMIT 1
       ) AS "lastMessageBody",
       COUNT(m.id)::int AS "messageCount"
     FROM conversations c
     LEFT JOIN messages m ON m."conversationId" = c.id
     WHERE c.id = $1
     GROUP BY c.id
     LIMIT 1`,
    [conversationId]
  )

  if (!conversationResult.rowCount) {
    return null
  }

  const messages = await listMessagesForConversation(conversationId)

  return {
    conversation: conversationResult.rows[0],
    messages,
  }
}
