import {
  listMessagesForConversation,
  promoteOldestQueuedConversation,
  type ConversationRecord,
} from "@/lib/conversations"
import { syncUserMessageToDiscord } from "@/lib/discord-bot"

const fallbackActiveConversationLimit = 1
const configuredActiveConversationLimit = Number(
  process.env.MAX_PENDING_CONVERSATIONS ?? fallbackActiveConversationLimit
)

export const MAX_ACTIVE_PENDING_CONVERSATIONS =
  Number.isFinite(configuredActiveConversationLimit) && configuredActiveConversationLimit > 0
    ? configuredActiveConversationLimit
    : fallbackActiveConversationLimit

export async function promoteNextQueuedConversation() {
  const conversation = await promoteOldestQueuedConversation(
    MAX_ACTIVE_PENDING_CONVERSATIONS
  )
  if (!conversation) return null

  await syncQueuedConversationToDiscord(conversation)
  return conversation
}

async function syncQueuedConversationToDiscord(conversation: ConversationRecord) {
  const messages = await listMessagesForConversation(conversation.id)

  for (const message of messages) {
    if (message.senderType !== "user") continue
    await syncUserMessageToDiscord(conversation, message, {
      notify: false,
      notifyOnThreadCreate: false,
    })
  }
}
