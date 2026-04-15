import { deleteDiscordThreadForConversation } from "@/lib/discord-bot"
import {
  deleteConversationsForUser,
  listConversationIdsForGuestUsersLastUpdatedBefore,
  listMessagesForConversation,
} from "@/lib/conversations"
import { deleteUploadedImageByUrl } from "@/lib/image-uploads"

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

  const expiredMessages = await Promise.all(
    conversationIds.map((conversationId) => listMessagesForConversation(conversationId))
  )
  const imageUrls = [...new Set(expiredMessages.flat().map((message) => message.imageUrl))]

  await Promise.all(imageUrls.map((imageUrl) => deleteUploadedImageByUrl(imageUrl)))

  await deleteConversationsForUser("guest:%", { patternMatch: true, updatedBefore: expiredBefore })

  return conversationIds.length
}
