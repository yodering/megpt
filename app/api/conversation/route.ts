import { NextResponse } from "next/server"
import { getConversationForUser } from "@/lib/conversations"
import { ensureDiscordBot } from "@/lib/discord-bot"
import { requireSession } from "@/lib/server-auth"

export const runtime = "nodejs"

export async function GET() {
  await ensureDiscordBot()
  const session = await requireSession()

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const conversation = await getConversationForUser(
    session.user.email,
    session.user.name
  )
  return NextResponse.json(conversation)
}
