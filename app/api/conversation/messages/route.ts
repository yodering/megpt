import { NextRequest, NextResponse } from "next/server"
import {
  createMessage,
  getConversationById,
  getConversationByIdForUser,
  getOrCreateConversationForUser,
} from "@/lib/conversations"
import { syncUserMessageToDiscord } from "@/lib/discord-bot"
import { requireSession } from "@/lib/server-auth"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  const session = await requireSession()

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const text = typeof body.text === "string" ? body.text.trim() : ""
  const conversationId =
    typeof body.conversationId === "number" ? body.conversationId : null

  if (!text) {
    return NextResponse.json({ error: "No text" }, { status: 400 })
  }

  const conversation =
    (conversationId
      ? await getConversationByIdForUser(conversationId, session.user.email)
      : null) ??
    (await getOrCreateConversationForUser(session.user.email, session.user.name))

  if (conversation.status === "awaiting_admin") {
    return NextResponse.json(
      { error: "A reply is already pending for this conversation." },
      { status: 409 }
    )
  }

  const message = await createMessage(conversation.id, "user", text)
  const updatedConversation = await getConversationById(conversation.id)
  await syncUserMessageToDiscord(
    {
      id: conversation.id,
      userEmail: conversation.userEmail,
      userName: conversation.userName,
    },
    message
  )

  return NextResponse.json({
    conversation: updatedConversation ?? conversation,
    message,
  })
}
