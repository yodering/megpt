import { NextRequest, NextResponse } from "next/server"
import {
  countAwaitingAdminConversations,
  countAwaitingAdminConversationsForUser,
  createMessage,
  getConversationById,
  getConversationByIdForUser,
  getOrCreateConversationForUser,
} from "@/lib/conversations"
import { syncUserMessageToDiscord } from "@/lib/discord-bot"
import { requireSession } from "@/lib/server-auth"

export const runtime = "nodejs"

const MAX_PENDING_CONVERSATIONS = Number(process.env.MAX_PENDING_CONVERSATIONS ?? 20)
const MAX_PENDING_CONVERSATIONS_PER_USER = Number(
  process.env.MAX_PENDING_CONVERSATIONS_PER_USER ?? 1
)

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

  const [pendingForUser, pendingGlobal] = await Promise.all([
    countAwaitingAdminConversationsForUser(session.user.email),
    countAwaitingAdminConversations(),
  ])

  if (pendingForUser >= MAX_PENDING_CONVERSATIONS_PER_USER) {
    return NextResponse.json(
      {
        error:
          "You already have a message waiting for a reply. Please wait for that response before starting another request.",
      },
      { status: 429 }
    )
  }

  if (pendingGlobal >= MAX_PENDING_CONVERSATIONS) {
    return NextResponse.json(
      {
        error:
          "MeGPT is at reply capacity right now. Please try again a little later.",
      },
      { status: 429 }
    )
  }

  const message = await createMessage(conversation.id, "user", text)
  const updatedConversation = await getConversationById(conversation.id)
  await syncUserMessageToDiscord(
    updatedConversation ?? conversation,
    message
  )

  return NextResponse.json({
    conversation: updatedConversation ?? conversation,
    message,
  })
}
