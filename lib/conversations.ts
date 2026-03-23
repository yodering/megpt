import { getDbPool } from "@/lib/db"

export type ConversationSummary = {
  id: number
  userId: number
  userName: string | null
  userEmail: string | null
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

export async function getOrCreateConversationForUser(userId: number) {
  const pool = getDbPool()

  const existing = await pool.query<{
    id: number
    userId: number
    status: string
    createdAt: string
    updatedAt: string
    lastMessageAt: string
  }>(
    `SELECT id, "userId", status, "createdAt", "updatedAt", "lastMessageAt"
     FROM conversations
     WHERE "userId" = $1
     LIMIT 1`,
    [userId]
  )

  if (existing.rowCount) {
    return existing.rows[0]
  }

  const created = await pool.query<{
    id: number
    userId: number
    status: string
    createdAt: string
    updatedAt: string
    lastMessageAt: string
  }>(
    `INSERT INTO conversations ("userId")
     VALUES ($1)
     RETURNING id, "userId", status, "createdAt", "updatedAt", "lastMessageAt"`,
    [userId]
  )

  return created.rows[0]
}

export async function listMessagesForConversation(conversationId: number) {
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

export async function getConversationForUser(userId: number) {
  const conversation = await getOrCreateConversationForUser(userId)
  const messages = await listMessagesForConversation(conversation.id)

  return { conversation, messages }
}

export async function listConversationsForAdmin() {
  const pool = getDbPool()
  const result = await pool.query<ConversationSummary>(
    `SELECT
       c.id,
       c."userId" AS "userId",
       u.name AS "userName",
       u.email AS "userEmail",
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
     JOIN users u ON u.id = c."userId"
     LEFT JOIN messages m ON m."conversationId" = c.id
     GROUP BY c.id, u.id
     ORDER BY c."lastMessageAt" DESC, c.id DESC`
  )

  return result.rows
}

export async function getConversationForAdmin(conversationId: number) {
  const pool = getDbPool()

  const conversationResult = await pool.query<ConversationSummary>(
    `SELECT
       c.id,
       c."userId" AS "userId",
       u.name AS "userName",
       u.email AS "userEmail",
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
     JOIN users u ON u.id = c."userId"
     LEFT JOIN messages m ON m."conversationId" = c.id
     WHERE c.id = $1
     GROUP BY c.id, u.id
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
