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
  contentType?: "text" | "image"
  imageUrl?: string | null
  isNew?: boolean
}

interface ConversationMessagePayload {
  senderType: string
  body: string
  contentType?: "text" | "image"
  imageUrl?: string | null
}

interface Conversation {
  id: number
  status: string
}

interface ConversationSummary {
  id: number
  lastMessageBody: string | null
  messageCount: number
}

export default function Home() {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [composerNotice, setComposerNotice] = useState<string | null>(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [conversationId, setConversationId] = useState<number | null>(null)
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [conversations, setConversations] = useState<ConversationSummary[]>([])

  const isAwaitingReply = conversation?.status === "awaiting_admin"
  const inputDisabled = isLoading || isAwaitingReply
  const sidebarChats = conversations.map((item) => ({
    id: item.id,
    title:
      item.lastMessageBody?.slice(0, 36) ||
      (item.messageCount > 0 ? "Conversation" : "New chat"),
    preview: item.lastMessageBody,
  }))

  function toUiMessage(message: ConversationMessagePayload, isNew = false): Message {
    return {
      role: message.senderType === "user" ? "user" : "assistant",
      content: message.body,
      contentType: message.contentType ?? "text",
      imageUrl: message.imageUrl ?? null,
      isNew,
    }
  }

  useEffect(() => {
    if (!session) return

    async function loadConversation(activeId?: number | null) {
      const search = activeId ? `?conversationId=${activeId}` : ""
      const response = await fetch(`/api/conversation${search}`, { cache: "no-store" })
      if (!response.ok) return
      const data = await response.json()
      setComposerNotice(null)
      setConversations(data.conversations)
      setConversationId(data.activeConversation?.id ?? null)
      setConversation(data.activeConversation)
      setMessages(data.messages.map((message: ConversationMessagePayload) => toUiMessage(message)))
    }

    loadConversation()
  }, [session])

  useEffect(() => {
    if (!session || !conversationId) return

    const es = new EventSource(`/api/sse?conversationId=${conversationId}`)
    es.onmessage = (e) => {
      const data = JSON.parse(e.data)
      setMessages((prev) => [...prev, toUiMessage(data.message, true)])
      setConversation((prev) =>
        prev
          ? {
              ...prev,
              status: "awaiting_user",
            }
          : prev
      )
      setComposerNotice(null)
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
    setComposerNotice(null)

    const response = await fetch("/api/conversation/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, conversationId }),
    })

    if (!response.ok) {
      const data = await response.json().catch(() => null)
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
      setComposerNotice(
        typeof data?.error === "string"
          ? data.error
          : "Your message could not be sent right now."
      )
      setMessages((prev) => prev.slice(0, -1))
      return
    }

    const data = await response.json()
    setComposerNotice(null)
    setConversation(data.conversation)
    setConversationId(data.conversation.id)
    setConversations((prev) => {
      const next = prev.filter((item) => item.id !== data.conversation.id)
      return [
        {
          id: data.conversation.id,
          lastMessageBody: text,
          messageCount:
            (prev.find((item) => item.id === data.conversation.id)?.messageCount ?? 0) + 1,
        },
        ...next,
      ]
    })
  }

  async function handleNewChat() {
    if (!session) {
      signIn("google")
      return
    }

    const response = await fetch("/api/conversation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    })

    if (!response.ok) return

    const data = await response.json()
    setComposerNotice(null)
    setConversations(data.conversations)
    setConversationId(data.conversation.id)
    setConversation(data.conversation)
    setMessages([])
    setIsLoading(false)
  }

  async function handleSelectConversation(nextConversationId: number) {
    if (!session) return

    const response = await fetch(`/api/conversation?conversationId=${nextConversationId}`, {
      cache: "no-store",
    })
    if (!response.ok) return

    const data = await response.json()
    setComposerNotice(null)
    setConversations(data.conversations)
    setConversationId(data.activeConversation?.id ?? null)
    setConversation(data.activeConversation)
    setMessages(data.messages.map((message: ConversationMessagePayload) => toUiMessage(message)))
    setIsLoading(false)
  }

  async function handleDeleteConversation(conversationToDeleteId: number) {
    if (!session) return

    const response = await fetch(`/api/conversation/${conversationToDeleteId}`, {
      method: "DELETE",
    })

    if (!response.ok) return

    const data = await response.json()
    const remainingConversations = data.conversations as ConversationSummary[]
    const nextConversationId =
      conversationId === conversationToDeleteId
        ? (remainingConversations[0]?.id ?? null)
        : conversationId

    setConversations(remainingConversations)

    if (!nextConversationId) {
      setConversationId(null)
      setConversation(null)
      setMessages([])
      setIsLoading(false)
      return
    }

    await handleSelectConversation(nextConversationId)
  }

  return (
    <div className="flex h-screen bg-white">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        conversations={sidebarChats}
        activeConversationId={conversationId}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
        onDeleteConversation={handleDeleteConversation}
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
                helperText={
                  composerNotice ?? "MeGPT can make mistakes. Check important info."
                }
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
                helperText={
                  composerNotice ?? "MeGPT can make mistakes. Check important info."
                }
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
