import { ensureAppSchema, getDbPool } from "@/lib/db"

export type ConversationSummary = {
  id: number
  userEmail: string
  userName: string | null
  status: ConversationStatus
  isPinned: boolean
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
  status: ConversationStatus
  isPinned: boolean
  pinnedAt: string | null
  createdAt: string
  updatedAt: string
  lastMessageAt: string
}

export type ConversationStatus = "open" | "queued" | "awaiting_admin" | "awaiting_user"

export const ACTIVE_OPERATOR_STATUS: ConversationStatus = "awaiting_admin"
export const QUEUED_OPERATOR_STATUS: ConversationStatus = "queued"
export const WAITING_ON_USER_STATUS: ConversationStatus = "awaiting_user"
export const PENDING_OPERATOR_STATUSES: ConversationStatus[] = [
  ACTIVE_OPERATOR_STATUS,
  QUEUED_OPERATOR_STATUS,
]

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
     RETURNING
       id,
       "userEmail",
       "userName",
       status,
       "isPinned" AS "isPinned",
       "pinnedAt" AS "pinnedAt",
       "createdAt",
       "updatedAt",
       "lastMessageAt"`,
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
    `SELECT
       id,
       "userEmail",
       "userName",
       status,
       "isPinned" AS "isPinned",
       "pinnedAt" AS "pinnedAt",
       "createdAt",
       "updatedAt",
       "lastMessageAt"
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
    nextStatus?: ConversationStatus
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

  const nextStatus =
    options?.nextStatus ??
    (senderType === "user" ? ACTIVE_OPERATOR_STATUS : WAITING_ON_USER_STATUS)

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
    `SELECT
       id,
       "userEmail",
       "userName",
       status,
       "isPinned" AS "isPinned",
       "pinnedAt" AS "pinnedAt",
       "createdAt",
       "updatedAt",
       "lastMessageAt"
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
    `SELECT
       id,
       "userEmail",
       "userName",
       status,
       "isPinned" AS "isPinned",
       "pinnedAt" AS "pinnedAt",
       "createdAt",
       "updatedAt",
       "lastMessageAt"
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

export async function setConversationPinnedForUser(
  conversationId: number,
  userEmail: string,
  isPinned: boolean
) {
  await ensureAppSchema()
  const pool = getDbPool()
  const result = await pool.query<ConversationRecord>(
    `UPDATE conversations
     SET
       "isPinned" = $3,
       "pinnedAt" = CASE WHEN $3 THEN NOW() ELSE NULL END,
       "updatedAt" = NOW()
     WHERE id = $1 AND "userEmail" = $2
     RETURNING
       id,
       "userEmail",
       "userName",
       status,
       "isPinned" AS "isPinned",
       "pinnedAt" AS "pinnedAt",
       "createdAt",
       "updatedAt",
       "lastMessageAt"`,
    [conversationId, userEmail, isPinned]
  )

  return result.rows[0] ?? null
}

export async function deleteConversationsForUser(
  userEmail: string,
  options?: {
    patternMatch?: boolean
    updatedBefore?: Date
  }
) {
  await ensureAppSchema()
  const pool = getDbPool()
  const updatedBefore = options?.updatedBefore
  const patternMatch = options?.patternMatch ?? false
  const result = await pool.query<{ id: number }>(
    `DELETE FROM conversations
     WHERE "userEmail" ${patternMatch ? "LIKE" : "="} $1
       ${updatedBefore ? `AND "updatedAt" < $2` : ""}
     RETURNING id`,
    updatedBefore ? [userEmail, updatedBefore] : [userEmail]
  )

  return result.rows.map((row) => row.id)
}

export async function listConversationIdsForGuestUsersLastUpdatedBefore(updatedBefore: Date) {
  await ensureAppSchema()
  const pool = getDbPool()
  const result = await pool.query<{ id: number }>(
    `SELECT id
     FROM conversations
     WHERE "userEmail" LIKE 'guest:%'
       AND "updatedAt" < $1`,
    [updatedBefore]
  )

  return result.rows.map((row) => row.id)
}

export async function releasePendingConversationsLastUpdatedBefore(updatedBefore: Date) {
  await ensureAppSchema()
  const pool = getDbPool()
  const result = await pool.query<{ id: number }>(
    `UPDATE conversations
     SET
       status = 'open',
       "updatedAt" = NOW()
     WHERE status = ANY($1::text[])
       AND "lastMessageAt" < $2
     RETURNING id`,
    [PENDING_OPERATOR_STATUSES, updatedBefore]
  )

  return result.rows.map((row) => row.id)
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
       c."isPinned" AS "isPinned",
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
     ORDER BY
       c."isPinned" DESC,
       COALESCE(c."pinnedAt", c."lastMessageAt") DESC,
       c."lastMessageAt" DESC,
       c.id DESC`,
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
     WHERE status = $1`,
    [ACTIVE_OPERATOR_STATUS]
  )

  return Number(result.rows[0]?.count ?? 0)
}

export async function countPendingOperatorConversationsForUser(userEmail: string) {
  await ensureAppSchema()
  const pool = getDbPool()
  const result = await pool.query<{ count: string }>(
    `SELECT COUNT(*)::text AS count
     FROM conversations
     WHERE status = ANY($1::text[]) AND "userEmail" = $2`,
    [PENDING_OPERATOR_STATUSES, userEmail]
  )

  return Number(result.rows[0]?.count ?? 0)
}

export async function promoteOldestQueuedConversation(maxActiveConversations: number) {
  await ensureAppSchema()
  const pool = getDbPool()
  const client = await pool.connect()

  try {
    await client.query("BEGIN")
    await client.query("SELECT pg_advisory_xact_lock($1)", [345001])

    const activeCountResult = await client.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count
       FROM conversations
       WHERE status = $1`,
      [ACTIVE_OPERATOR_STATUS]
    )

    if (Number(activeCountResult.rows[0]?.count ?? 0) >= maxActiveConversations) {
      await client.query("COMMIT")
      return null
    }

    const promoted = await client.query<ConversationRecord>(
      `WITH next_conversation AS (
         SELECT id
         FROM conversations
         WHERE status = $1
         ORDER BY "lastMessageAt" ASC, id ASC
         LIMIT 1
         FOR UPDATE SKIP LOCKED
       )
       UPDATE conversations c
       SET
         status = $2,
         "updatedAt" = NOW()
       FROM next_conversation
       WHERE c.id = next_conversation.id
       RETURNING
         c.id,
         c."userEmail",
         c."userName",
         c.status,
         c."isPinned" AS "isPinned",
         c."pinnedAt" AS "pinnedAt",
         c."createdAt",
         c."updatedAt",
         c."lastMessageAt"`,
      [QUEUED_OPERATOR_STATUS, ACTIVE_OPERATOR_STATUS]
    )

    await client.query("COMMIT")
    return promoted.rows[0] ?? null
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined)
    throw error
  } finally {
    client.release()
  }
}
