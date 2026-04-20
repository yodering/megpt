import {
  listMessagesForConversation,
  promoteOldestQueuedConversation,
  type ConversationRecord,
} from "@/lib/conversations"
import { getDiscordThreadByConversationId } from "@/lib/discord-threads"
import { syncUserMessageToDiscord } from "@/lib/discord-bot"
import { cleanupStalePendingConversations } from "@/lib/stale-pending-conversations"

const fallbackActiveConversationLimit = 1
const configuredActiveConversationLimit = Number(
  process.env.MAX_PENDING_CONVERSATIONS ?? fallbackActiveConversationLimit
)

export const MAX_ACTIVE_PENDING_CONVERSATIONS =
  Number.isFinite(configuredActiveConversationLimit) && configuredActiveConversationLimit > 0
    ? configuredActiveConversationLimit
    : fallbackActiveConversationLimit

export async function normalizePendingConversationQueue() {
  const releasedCount = await cleanupStalePendingConversations()
  const promotedConversations: ConversationRecord[] = []

  while (true) {
    const conversation = await promoteOldestQueuedConversation(
      MAX_ACTIVE_PENDING_CONVERSATIONS
    )
    if (!conversation) {
      return {
        releasedCount,
        promotedConversations,
      }
    }

    await syncQueuedConversationToDiscord(conversation)
    promotedConversations.push(conversation)
  }
}

export async function promoteNextQueuedConversation() {
  const { promotedConversations } = await normalizePendingConversationQueue()
  return promotedConversations[0] ?? null
}

async function syncQueuedConversationToDiscord(conversation: ConversationRecord) {
  const existingThread = await getDiscordThreadByConversationId(conversation.id)
  if (existingThread) {
    return
  }

  const messages = await listMessagesForConversation(conversation.id)

  for (const message of messages) {
    if (message.senderType !== "user") continue
    await syncUserMessageToDiscord(conversation, message)
  }
}
