import { NextResponse } from "next/server"
import { getConversationForUser } from "@/lib/conversations"
import { requireSession } from "@/lib/server-auth"

export const runtime = "nodejs"

export async function GET() {
  const session = await requireSession()

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const conversation = await getConversationForUser(Number(session.user.id))
  return NextResponse.json(conversation)
}
