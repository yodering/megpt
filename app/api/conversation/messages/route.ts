import { NextRequest, NextResponse } from "next/server"
import {
  ACTIVE_OPERATOR_STATUS,
  QUEUED_OPERATOR_STATUS,
  countAwaitingAdminConversations,
  countPendingOperatorConversationsForUser,
  createMessage,
  getConversationById,
  getConversationByIdForUser,
  getOrCreateConversationForUser,
} from "@/lib/conversations"
import { MAX_ACTIVE_PENDING_CONVERSATIONS } from "@/lib/conversation-queue"
import { syncUserMessageToDiscord } from "@/lib/discord-bot"
import { cleanupExpiredGuestConversations } from "@/lib/guest-conversations"
import {
  deleteUploadedImageByUrl,
  saveUploadedImage,
} from "@/lib/image-uploads"
import { MESSAGE_MAX_CHARS } from "@/lib/message-limit"
import { getRequestIdentity } from "@/lib/request-identity"

export const runtime = "nodejs"

const MAX_PENDING_CONVERSATIONS_PER_USER = Number(
  process.env.MAX_PENDING_CONVERSATIONS_PER_USER ?? 1
)

async function parseIncomingMessage(req: NextRequest) {
  const contentType = req.headers.get("content-type") ?? ""

  if (contentType.includes("multipart/form-data")) {
    const formData = await req.formData()
    const textValue = formData.get("text")
    const conversationIdValue = formData.get("conversationId")
    const imageValue = formData.get("image")
    const nextConversationId =
      typeof conversationIdValue === "string" && Number.isFinite(Number(conversationIdValue))
        ? Number(conversationIdValue)
        : null

    return {
      text: typeof textValue === "string" ? textValue.trim() : "",
      conversationId: nextConversationId,
      imageFile:
        imageValue instanceof File && imageValue.size > 0 ? imageValue : null,
    }
  }

  const body = await req.json()

  return {
    text: typeof body.text === "string" ? body.text.trim() : "",
    conversationId:
      typeof body.conversationId === "number" ? body.conversationId : null,
    imageFile: null,
  }
}

export async function POST(req: NextRequest) {
  const identity = await getRequestIdentity(req)

  if (!identity) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (identity.isGuest) {
    await cleanupExpiredGuestConversations()
  }

  const { text, conversationId, imageFile } = await parseIncomingMessage(req)

  if (!text && !imageFile) {
    return NextResponse.json({ error: "Add text or an image." }, { status: 400 })
  }

  if (text.length > MESSAGE_MAX_CHARS) {
    return NextResponse.json(
      { error: `Messages must be ${MESSAGE_MAX_CHARS} characters or fewer.` },
      { status: 400 }
    )
  }

  const conversation =
    (conversationId
      ? await getConversationByIdForUser(conversationId, identity.userEmail)
      : null) ??
    (await getOrCreateConversationForUser(identity.userEmail, identity.userName))

  if (
    conversation.status === ACTIVE_OPERATOR_STATUS ||
    conversation.status === QUEUED_OPERATOR_STATUS
  ) {
    return NextResponse.json(
      {
        error:
          conversation.status === QUEUED_OPERATOR_STATUS
            ? "This conversation is queued for review already."
            : "A reply is already pending for this conversation.",
      },
      { status: 409 }
    )
  }

  const [pendingForUser, pendingGlobal] = await Promise.all([
    countPendingOperatorConversationsForUser(identity.userEmail),
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

  const nextStatus =
    pendingGlobal >= MAX_ACTIVE_PENDING_CONVERSATIONS
      ? QUEUED_OPERATOR_STATUS
      : ACTIVE_OPERATOR_STATUS

  let uploadedImageUrl: string | null = null

  if (imageFile) {
    try {
      const upload = await saveUploadedImage(imageFile)
      uploadedImageUrl = upload.publicUrl
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Image upload failed." },
        { status: 400 }
      )
    }
  }

  let message

  try {
    message = await createMessage(conversation.id, "user", text, {
      contentType: uploadedImageUrl ? "image" : "text",
      imageUrl: uploadedImageUrl,
      nextStatus,
    })
  } catch (error) {
    await deleteUploadedImageByUrl(uploadedImageUrl)
    throw error
  }

  const updatedConversation = await getConversationById(conversation.id)

  try {
    if (nextStatus === ACTIVE_OPERATOR_STATUS) {
      await syncUserMessageToDiscord(updatedConversation ?? conversation, message)
    }
  } catch (error) {
    console.error("Failed to sync user message to Discord", error)
  }

  return NextResponse.json({
    conversation: updatedConversation ?? conversation,
    message,
  })
}
