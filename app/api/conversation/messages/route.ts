import { NextRequest, NextResponse } from "next/server"
import { createMessage, getOrCreateConversationForUser } from "@/lib/conversations"
import { requireSession } from "@/lib/server-auth"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  const session = await requireSession()

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const text = typeof body.text === "string" ? body.text.trim() : ""

  if (!text) {
    return NextResponse.json({ error: "No text" }, { status: 400 })
  }

  const conversation = await getOrCreateConversationForUser(Number(session.user.id))
  const message = await createMessage(conversation.id, "user", text)

  return NextResponse.json({ conversation, message })
}
