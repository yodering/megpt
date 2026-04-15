import type { ConversationMessage } from "@/lib/conversations"

const clients = new Map<string, ReadableStreamDefaultController>()

export function sendToClient(conversationId: string, message: ConversationMessage) {
  const controller = clients.get(conversationId)
  if (controller) {
    controller.enqueue(`data: ${JSON.stringify({ message })}\n\n`)
  }
}

export function registerSseClient(
  conversationId: string,
  controller: ReadableStreamDefaultController
) {
  clients.set(conversationId, controller)
}

export function unregisterSseClient(conversationId: string) {
  clients.delete(conversationId)
}
