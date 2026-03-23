import { NextRequest, NextResponse } from "next/server"
import { getConversationForAdmin } from "@/lib/conversations"
import { requireAdminSession } from "@/lib/server-auth"

export const runtime = "nodejs"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdminSession()

  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params
  const conversation = await getConversationForAdmin(Number(id))

  if (!conversation) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return NextResponse.json(conversation)
}
