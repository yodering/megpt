import { NextRequest, NextResponse } from "next/server"
import { sendToClient } from "@/app/api/sse/route"
import type { ConversationMessage } from "@/lib/conversations"

const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`

export async function sendToTelegram(text: string, userEmail: string, conversationId: string) {
  await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: process.env.TELEGRAM_CHAT_ID,
      text: `👤 ${userEmail}\n🔑 ${conversationId}\n\n${text}`,
    }),
  })
}

export async function POST(req: NextRequest) {
  const body = await req.json()

  // Handle incoming Telegram webhook (your replies)
  if (body.message) {
    const text = body.message.text
    // Parse conversationId from your reply format: "convId: your message"
    const match = text.match(/^(.+?):\s([\s\S]+)$/)
    if (match) {
      const [, conversationId, message] = match
      sendToClient(conversationId.trim(), {
        id: 0,
        conversationId: Number(conversationId.trim()) || 0,
        senderType: "operator",
        body: message.trim(),
        contentType: "text",
        imageUrl: null,
        createdAt: new Date().toISOString(),
      } satisfies ConversationMessage)
    }
    return NextResponse.json({ ok: true })
  }

  // Handle outgoing messages from web app
  const { text, userEmail, conversationId } = body
  if (!text) return NextResponse.json({ error: "No text" }, { status: 400 })
  await sendToTelegram(text, userEmail, conversationId)
  return NextResponse.json({ ok: true })
}
