import { releasePendingConversationsLastUpdatedBefore } from "@/lib/conversations"

const fallbackPendingTtlHours = 72
const configuredPendingTtlHours = Number(
  process.env.PENDING_CONVERSATION_TTL_HOURS ?? fallbackPendingTtlHours
)

export const PENDING_CONVERSATION_TTL_HOURS =
  Number.isFinite(configuredPendingTtlHours) && configuredPendingTtlHours > 0
    ? configuredPendingTtlHours
    : fallbackPendingTtlHours

export function getPendingConversationExpiryDate() {
  return new Date(Date.now() - PENDING_CONVERSATION_TTL_HOURS * 60 * 60 * 1000)
}

export async function cleanupStalePendingConversations() {
  const expiredBefore = getPendingConversationExpiryDate()
  const releasedConversationIds =
    await releasePendingConversationsLastUpdatedBefore(expiredBefore)

  return releasedConversationIds.length
}
