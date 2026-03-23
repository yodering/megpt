import { NextRequest, NextResponse } from "next/server"
import { sendToClient } from "@/app/api/sse/route"
import { createMessage } from "@/lib/conversations"
import { requireAdminSession } from "@/lib/server-auth"

export const runtime = "nodejs"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdminSession()

  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await req.json()
  const text = typeof body.text === "string" ? body.text.trim() : ""

  if (!text) {
    return NextResponse.json({ error: "No text" }, { status: 400 })
  }

  const { id } = await params
  const conversationId = Number(id)
  const message = await createMessage(conversationId, "operator", text)

  sendToClient(String(conversationId), message.body)

  return NextResponse.json({ message })
}
