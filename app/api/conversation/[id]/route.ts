import { NextRequest, NextResponse } from "next/server"
import { deleteDiscordThreadForConversation, ensureDiscordBot } from "@/lib/discord-bot"
import {
  deleteConversationForUser,
  getConversationByIdForUser,
  listMessagesForConversation,
  listConversationsForUser,
  setConversationPinnedForUser,
} from "@/lib/conversations"
import { cleanupExpiredGuestConversations } from "@/lib/guest-conversations"
import { deleteUploadedImageByUrl } from "@/lib/image-uploads"
import { getOrCreateRequestIdentity, setGuestIdentityCookie } from "@/lib/request-identity"

export const runtime = "nodejs"

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await ensureDiscordBot()
  const { identity, setGuestCookie } = await getOrCreateRequestIdentity(_req)

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
  const messages = await listMessagesForConversation(conversationId)

  const deleted = await deleteConversationForUser(conversationId, identity.userEmail)

  if (!deleted) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  await Promise.all(
    messages.map((message) => deleteUploadedImageByUrl(message.imageUrl))
  )

  const conversations = await listConversationsForUser(identity.userEmail)

  const response = NextResponse.json({ ok: true, conversations })
  if (setGuestCookie) setGuestIdentityCookie(response, identity)

  return response
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { identity, setGuestCookie } = await getOrCreateRequestIdentity(req)

  if (identity.isGuest) {
    await cleanupExpiredGuestConversations()
  }

  const { id } = await params
  const conversationId = Number(id)

  if (!Number.isFinite(conversationId)) {
    return NextResponse.json({ error: "Invalid conversation id" }, { status: 400 })
  }

  const body = await req.json().catch(() => null)
  const pinned = body?.pinned

  if (typeof pinned !== "boolean") {
    return NextResponse.json({ error: "Invalid pinned value" }, { status: 400 })
  }

  const conversation = await setConversationPinnedForUser(
    conversationId,
    identity.userEmail,
    pinned
  )

  if (!conversation) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const conversations = await listConversationsForUser(identity.userEmail)

  const response = NextResponse.json({ ok: true, conversation, conversations })
  if (setGuestCookie) setGuestIdentityCookie(response, identity)

  return response
}
