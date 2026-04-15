import { NextRequest } from "next/server"
import { registerSseClient, unregisterSseClient } from "@/lib/sse-broker"

export async function GET(req: NextRequest) {
  const conversationId = req.nextUrl.searchParams.get("conversationId")
  if (!conversationId) return new Response("Missing conversationId", { status: 400 })

  const stream = new ReadableStream({
    start(controller) {
      registerSseClient(conversationId, controller)
      req.signal.addEventListener("abort", () => {
        unregisterSseClient(conversationId)
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
