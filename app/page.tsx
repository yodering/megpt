"use client"

import { signIn, useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { ChatHeader } from "@/components/chat-header"
import { ChatInput } from "@/components/chat-input"
import { ChatMessages } from "@/components/chat-messages"
import { HeroPrompt } from "@/components/hero-prompt"

interface Message {
  role: string
  content: string
  isNew?: boolean
}

export default function Home() {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)

  useEffect(() => {
    if (!session) return

    async function loadConversation() {
      const response = await fetch("/api/conversation", { cache: "no-store" })
      if (!response.ok) return
      const data = await response.json()
      setConversationId(String(data.conversation.id))
      setMessages(
        data.messages.map((message: { senderType: string; body: string }) => ({
          role: message.senderType === "user" ? "user" : "assistant",
          content: message.body,
        }))
      )
    }

    loadConversation()
  }, [session])

  useEffect(() => {
    if (!session || !conversationId) return

    const es = new EventSource(`/api/sse?conversationId=${conversationId}`)
    es.onmessage = (e) => {
      const data = JSON.parse(e.data)
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.message, isNew: true },
      ])
      setIsLoading(false)
    }

    return () => es.close()
  }, [conversationId, session])

  async function handleSend(text: string) {
    if (!session) {
      signIn("google")
      return
    }

    setMessages((prev) => [...prev, { role: "user", content: text }])
    setIsLoading(true)

    const response = await fetch("/api/conversation/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    })

    if (!response.ok) {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-screen bg-white">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div className="flex flex-col flex-1 min-w-0">
        <ChatHeader />

        {messages.length === 0 ? (
          <>
            <HeroPrompt />
            <ChatInput onSend={handleSend} disabled={isLoading} />
          </>
        ) : (
          <>
            <ChatMessages messages={messages} isLoading={isLoading} />
            <ChatInput onSend={handleSend} disabled={isLoading} />
          </>
        )}
      </div>
    </div>
  )
}
