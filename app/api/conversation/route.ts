import { NextRequest, NextResponse } from "next/server"
import {
  createConversationForUser,
  getConversationForUser,
  listConversationsForUser,
} from "@/lib/conversations"
import { ensureDiscordBot } from "@/lib/discord-bot"
import { requireSession } from "@/lib/server-auth"

export const runtime = "nodejs"

export async function GET(req: NextRequest) {
  await ensureDiscordBot()
  const session = await requireSession()

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const conversationIdParam = Number(req.nextUrl.searchParams.get("conversationId"))
  const conversation = await getConversationForUser(
    session.user.email,
    session.user.name,
    Number.isFinite(conversationIdParam) ? conversationIdParam : null
  )
  const conversations = await listConversationsForUser(session.user.email)

  return NextResponse.json({
    conversations,
    activeConversation: conversation.conversation,
    messages: conversation.messages,
  })
}

export async function POST() {
  const session = await requireSession()

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const conversation = await createConversationForUser(
    session.user.email,
    session.user.name
  )
  const conversations = await listConversationsForUser(session.user.email)

  return NextResponse.json({ conversation, conversations })
}
