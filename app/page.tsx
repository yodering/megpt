"use client"

import Link from "next/link"
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

  const activeChatTitle =
    messages.find((message) => message.role === "user")?.content.slice(0, 36) ||
    "Current conversation"
  const activeChatPreview = messages[messages.length - 1]?.content || null
  const isAwaitingReply = conversation?.status === "awaiting_admin"
  const inputDisabled = isLoading || isAwaitingReply

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
      if (response.status === 409) {
        setConversation((prev) =>
          prev
            ? {
                ...prev,
                status: "awaiting_admin",
              }
            : prev
        )
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
            <div className="pb-4">
              <ChatInput
                onSend={handleSend}
                disabled={inputDisabled}
                placeholder={isAwaitingReply ? "MeGPT is still working..." : "Ask anything"}
                helperText="MeGPT can make mistakes. Check important info."
              />
              <FooterDisclosure />
            </div>
          </>
        ) : (
          <>
            <ChatMessages messages={messages} isLoading={isLoading} />
            <div className="pb-4">
              <ChatInput
                onSend={handleSend}
                disabled={inputDisabled}
                placeholder={isAwaitingReply ? "MeGPT is still working..." : "Ask anything"}
                helperText="MeGPT can make mistakes. Check important info."
              />
              <FooterDisclosure />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function FooterDisclosure() {
  return (
    <p className="px-6 text-center text-xs leading-5 text-[#8d877c]">
      By messaging MeGPT, a human, you agree to our{" "}
      <Link href="/terms" className="underline underline-offset-2 hover:text-[#5f5647]">
        Terms
      </Link>{" "}
      and have read our{" "}
      <Link
        href="/privacy"
        className="underline underline-offset-2 hover:text-[#5f5647]"
      >
        Privacy Policy
      </Link>
      .
    </p>
  )
}
