import { NextRequest, NextResponse } from "next/server"
import { deleteDiscordThreadForConversation, ensureDiscordBot } from "@/lib/discord-bot"
import {
  deleteConversationForUser,
  getConversationByIdForUser,
  listConversationsForUser,
} from "@/lib/conversations"
import { requireSession } from "@/lib/server-auth"

export const runtime = "nodejs"

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await ensureDiscordBot()
  const session = await requireSession()

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const conversationId = Number(id)

  if (!Number.isFinite(conversationId)) {
    return NextResponse.json({ error: "Invalid conversation id" }, { status: 400 })
  }

  const conversation = await getConversationByIdForUser(
    conversationId,
    session.user.email
  )

  if (!conversation) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  await deleteDiscordThreadForConversation(conversationId)

  const deleted = await deleteConversationForUser(conversationId, session.user.email)

  if (!deleted) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const conversations = await listConversationsForUser(session.user.email)

  return NextResponse.json({ ok: true, conversations })
}
