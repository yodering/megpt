import { NextRequest, NextResponse } from "next/server"
import {
  createConversationForUser,
  getConversationForUser,
  listConversationsForUser,
} from "@/lib/conversations"
import { ensureDiscordBot } from "@/lib/discord-bot"
import { cleanupExpiredGuestConversations } from "@/lib/guest-conversations"
import { getRequestIdentity } from "@/lib/request-identity"

export const runtime = "nodejs"

export async function GET(req: NextRequest) {
  await ensureDiscordBot()
  const identity = await getRequestIdentity(req)

  if (!identity) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (identity.isGuest) {
    await cleanupExpiredGuestConversations()
  }

  const conversationIdParam = Number(req.nextUrl.searchParams.get("conversationId"))
  const conversation = await getConversationForUser(
    identity.userEmail,
    identity.userName,
    Number.isFinite(conversationIdParam) ? conversationIdParam : null
  )
  const conversations = await listConversationsForUser(identity.userEmail)

  return NextResponse.json({
    conversations,
    activeConversation: conversation.conversation,
    messages: conversation.messages,
  })
}

export async function POST(req: NextRequest) {
  const identity = await getRequestIdentity(req)

  if (!identity) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (identity.isGuest) {
    await cleanupExpiredGuestConversations()
  }

  const conversation = await createConversationForUser(
    identity.userEmail,
    identity.userName
  )
  const conversations = await listConversationsForUser(identity.userEmail)

  return NextResponse.json({ conversation, conversations })
}
