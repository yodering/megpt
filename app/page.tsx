"use client"

import { useSession } from "next-auth/react"
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
  const conversationId = "test-123"

  useEffect(() => {
    if (!session) return
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
  }, [session])

  async function handleSend(text: string) {
    setMessages((prev) => [...prev, { role: "user", content: text }])
    setIsLoading(true)
    await fetch("/api/telegram", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        userEmail: session?.user?.email,
        conversationId,
      }),
    })
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
