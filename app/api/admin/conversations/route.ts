import { NextResponse } from "next/server"
import { listConversationsForAdmin } from "@/lib/conversations"
import { requireAdminSession } from "@/lib/server-auth"

export const runtime = "nodejs"

export async function GET() {
  const session = await requireAdminSession()

  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const conversations = await listConversationsForAdmin()
  return NextResponse.json({ conversations })
}
