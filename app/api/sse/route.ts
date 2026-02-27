import { NextRequest } from "next/server"

// Store active connections: conversationId -> controller
const clients = new Map<string, ReadableStreamDefaultController>()

export function sendToClient(conversationId: string, message: string) {
  const controller = clients.get(conversationId)
  if (controller) {
    controller.enqueue(`data: ${JSON.stringify({ message })}\n\n`)
  }
}

export async function GET(req: NextRequest) {
  const conversationId = req.nextUrl.searchParams.get("conversationId")
  if (!conversationId) return new Response("Missing conversationId", { status: 400 })

  const stream = new ReadableStream({
    start(controller) {
      clients.set(conversationId, controller)
      req.signal.addEventListener("abort", () => {
        clients.delete(conversationId)
        controller.close()
      })
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  })
}
