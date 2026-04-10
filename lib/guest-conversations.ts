import { deleteDiscordThreadForConversation } from "@/lib/discord-bot"
import {
  deleteConversationsForUser,
  listConversationIdsForGuestUsersLastUpdatedBefore,
} from "@/lib/conversations"

const fallbackGuestTtlMinutes = 30
const configuredGuestTtlMinutes = Number(process.env.GUEST_CONVERSATION_TTL_MINUTES ?? fallbackGuestTtlMinutes)

export const GUEST_CONVERSATION_TTL_MINUTES =
  Number.isFinite(configuredGuestTtlMinutes) && configuredGuestTtlMinutes > 0
    ? configuredGuestTtlMinutes
    : fallbackGuestTtlMinutes

export function getGuestConversationExpiryDate() {
  return new Date(Date.now() - GUEST_CONVERSATION_TTL_MINUTES * 60_000)
}

export async function cleanupExpiredGuestConversations() {
  const expiredBefore = getGuestConversationExpiryDate()
  const conversationIds = await listConversationIdsForGuestUsersLastUpdatedBefore(expiredBefore)

  if (conversationIds.length === 0) {
    return 0
  }

  await Promise.all(
    conversationIds.map((conversationId) => deleteDiscordThreadForConversation(conversationId))
  )

  await deleteConversationsForUser("guest:%", { patternMatch: true, updatedBefore: expiredBefore })

  return conversationIds.length
}
