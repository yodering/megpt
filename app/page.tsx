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

interface Conversation {
  id: number
  status: string
}

export default function Home() {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [queueMessage, setQueueMessage] = useState<string | null>(null)

  const activeChatTitle =
    messages.find((message) => message.role === "user")?.content.slice(0, 36) ||
    "Current conversation"
  const activeChatPreview = messages[messages.length - 1]?.content || null
  const isAwaitingReply = conversation?.status === "awaiting_admin"
  const inputDisabled = isLoading || isAwaitingReply

  const statusLabel = (() => {
    if (!session) return "Sign in to start a conversation."
    if (isLoading) return "Message received. MeGPT is preparing a response."
    if (isAwaitingReply) return "MeGPT is still working on your response."
    if (conversation?.status === "awaiting_user") return "Ready for your next message."
    return "Replies may take a few minutes during busy periods."
  })()

  useEffect(() => {
    if (!session) return

    async function loadConversation() {
      const response = await fetch("/api/conversation", { cache: "no-store" })
      if (!response.ok) return
      const data = await response.json()
      setConversationId(String(data.conversation.id))
      setConversation(data.conversation)
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
      setConversation((prev) =>
        prev
          ? {
              ...prev,
              status: "awaiting_user",
            }
          : prev
      )
      setIsLoading(false)
      setQueueMessage(null)
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
    setQueueMessage("Message received. MeGPT is processing it now.")

    const response = await fetch("/api/conversation/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    })

    if (!response.ok) {
      setIsLoading(false)
      if (response.status === 409) {
        setConversation((prev) =>
          prev
            ? {
                ...prev,
                status: "awaiting_admin",
              }
            : prev
        )
        setQueueMessage("MeGPT is still working on the current response.")
      } else {
        setQueueMessage("MeGPT could not process that message. Please try again.")
      }
      setMessages((prev) => prev.slice(0, -1))
      return
    }

    const data = await response.json()
    setConversation(data.conversation)
  }

  return (
    <div className="flex h-screen bg-white">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        activeChatTitle={conversationId ? activeChatTitle : null}
        activeChatPreview={conversationId ? activeChatPreview : null}
      />

      <div className="flex flex-col flex-1 min-w-0">
        <ChatHeader />

        {messages.length === 0 ? (
          <>
            <HeroPrompt />
            <div className="px-4">
              <div className="mx-auto mb-4 max-w-[672px] rounded-2xl border border-[#ece7da] bg-[#faf6ed] px-4 py-3 text-sm text-[#5f5647]">
                {queueMessage || statusLabel}
              </div>
            </div>
            <ChatInput
              onSend={handleSend}
              disabled={inputDisabled}
              placeholder={isAwaitingReply ? "MeGPT is still working..." : "Ask anything"}
              helperText={statusLabel}
            />
          </>
        ) : (
          <>
            <ChatMessages messages={messages} isLoading={isLoading} />
            <div className="px-4">
              <div className="mx-auto mb-4 max-w-[672px] rounded-2xl border border-[#ece7da] bg-[#faf6ed] px-4 py-3 text-sm text-[#5f5647]">
                {queueMessage || statusLabel}
              </div>
            </div>
            <ChatInput
              onSend={handleSend}
              disabled={inputDisabled}
              placeholder={isAwaitingReply ? "MeGPT is still working..." : "Ask anything"}
              helperText={statusLabel}
            />
          </>
        )}
      </div>
    </div>
  )
}
