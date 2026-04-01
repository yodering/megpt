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
  contentType: "text" | "image"
  imageUrl: string | null
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
  const latestConversation = await getLatestConversationForUser(userEmail, userName)

  if (latestConversation) {
    return latestConversation
  }

  return createConversationForUser(userEmail, userName)
}

export async function createConversationForUser(
  userEmail: string,
  userName?: string | null
) {
  await ensureAppSchema()
  const pool = getDbPool()

  const created = await pool.query<ConversationRecord>(
    `INSERT INTO conversations ("userEmail", "userName")
     VALUES ($1, $2)
     RETURNING id, "userEmail", "userName", status, "createdAt", "updatedAt", "lastMessageAt"`,
    [userEmail, userName ?? null]
  )

  return created.rows[0]
}

export async function getLatestConversationForUser(
  userEmail: string,
  userName?: string | null
) {
  await ensureAppSchema()
  const pool = getDbPool()

  const existing = await pool.query<ConversationRecord>(
    `SELECT id, "userEmail", "userName", status, "createdAt", "updatedAt", "lastMessageAt"
     FROM conversations
     WHERE "userEmail" = $1
     ORDER BY "lastMessageAt" DESC, id DESC
     LIMIT 1`,
    [userEmail]
  )

  if (!existing.rowCount) {
    return null
  }

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

export async function listMessagesForConversation(conversationId: number) {
  await ensureAppSchema()
  const pool = getDbPool()
  const result = await pool.query<ConversationMessage>(
    `SELECT
       id,
       "conversationId" AS "conversationId",
       "senderType" AS "senderType",
       body,
       "contentType" AS "contentType",
       "imageUrl" AS "imageUrl",
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
  body: string,
  options?: {
    contentType?: "text" | "image"
    imageUrl?: string | null
  }
) {
  await ensureAppSchema()
  const pool = getDbPool()
  const contentType = options?.contentType ?? "text"
  const imageUrl = options?.imageUrl ?? null

  const inserted = await pool.query<ConversationMessage>(
    `INSERT INTO messages ("conversationId", "senderType", body, "contentType", "imageUrl")
     VALUES ($1, $2, $3, $4, $5)
     RETURNING
       id,
       "conversationId" AS "conversationId",
       "senderType" AS "senderType",
       body,
       "contentType" AS "contentType",
       "imageUrl" AS "imageUrl",
       "createdAt" AS "createdAt"`,
    [conversationId, senderType, body, contentType, imageUrl]
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
  userName?: string | null,
  conversationId?: number | null
) {
  const conversation = conversationId
    ? await getConversationByIdForUser(conversationId, userEmail)
    : await getLatestConversationForUser(userEmail, userName)

  if (!conversation) {
    return { conversation: null, messages: [] }
  }

  const messages = await listMessagesForConversation(conversation.id)

  return { conversation, messages }
}

export async function getConversationByIdForUser(
  conversationId: number,
  userEmail: string
) {
  await ensureAppSchema()
  const pool = getDbPool()
  const result = await pool.query<ConversationRecord>(
    `SELECT id, "userEmail", "userName", status, "createdAt", "updatedAt", "lastMessageAt"
     FROM conversations
     WHERE id = $1 AND "userEmail" = $2
     LIMIT 1`,
    [conversationId, userEmail]
  )

  return result.rows[0] ?? null
}

export async function deleteConversationForUser(
  conversationId: number,
  userEmail: string
) {
  await ensureAppSchema()
  const pool = getDbPool()
  const result = await pool.query<{ id: number }>(
    `DELETE FROM conversations
     WHERE id = $1 AND "userEmail" = $2
     RETURNING id`,
    [conversationId, userEmail]
  )

  return (result.rowCount ?? 0) > 0
}

export async function listConversationsForUser(userEmail: string) {
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
         SELECT COALESCE(NULLIF(m.body, ''), CASE WHEN m."contentType" = 'image' THEN '[Image]' END)
         FROM messages m
         WHERE m."conversationId" = c.id
         ORDER BY m."createdAt" DESC, m.id DESC
         LIMIT 1
       ) AS "lastMessageBody",
       COUNT(m.id)::int AS "messageCount"
     FROM conversations c
     LEFT JOIN messages m ON m."conversationId" = c.id
     WHERE c."userEmail" = $1
     GROUP BY c.id
     ORDER BY c."lastMessageAt" DESC, c.id DESC`,
    [userEmail]
  )

  return result.rows
}

export async function countAwaitingAdminConversations() {
  await ensureAppSchema()
  const pool = getDbPool()
  const result = await pool.query<{ count: string }>(
    `SELECT COUNT(*)::text AS count
     FROM conversations
     WHERE status = 'awaiting_admin'`
  )

  return Number(result.rows[0]?.count ?? 0)
}

export async function countAwaitingAdminConversationsForUser(userEmail: string) {
  await ensureAppSchema()
  const pool = getDbPool()
  const result = await pool.query<{ count: string }>(
    `SELECT COUNT(*)::text AS count
     FROM conversations
     WHERE status = 'awaiting_admin' AND "userEmail" = $1`,
    [userEmail]
  )

  return Number(result.rows[0]?.count ?? 0)
}
