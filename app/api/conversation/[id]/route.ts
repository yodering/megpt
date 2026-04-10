import { NextRequest, NextResponse } from "next/server"
import { deleteDiscordThreadForConversation, ensureDiscordBot } from "@/lib/discord-bot"
import {
  deleteConversationForUser,
  getConversationByIdForUser,
  listConversationsForUser,
} from "@/lib/conversations"
import { cleanupExpiredGuestConversations } from "@/lib/guest-conversations"
import { getRequestIdentity } from "@/lib/request-identity"

export const runtime = "nodejs"

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await ensureDiscordBot()
  const identity = await getRequestIdentity(_req)

  if (!identity) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (identity.isGuest) {
    await cleanupExpiredGuestConversations()
  }

  const { id } = await params
  const conversationId = Number(id)

  if (!Number.isFinite(conversationId)) {
    return NextResponse.json({ error: "Invalid conversation id" }, { status: 400 })
  }

  const conversation = await getConversationByIdForUser(
    conversationId,
    identity.userEmail
  )

  if (!conversation) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  await deleteDiscordThreadForConversation(conversationId)

  const deleted = await deleteConversationForUser(conversationId, identity.userEmail)

  if (!deleted) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const conversations = await listConversationsForUser(identity.userEmail)

  return NextResponse.json({ ok: true, conversations })
}
