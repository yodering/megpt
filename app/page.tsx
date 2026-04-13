"use client"

import Link from "next/link"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { ChatHeader } from "@/components/chat-header"
import { ChatInput } from "@/components/chat-input"
import { ChatMessages } from "@/components/chat-messages"
import { HeroPrompt } from "@/components/hero-prompt"
import { MESSAGE_MAX_CHARS } from "@/lib/message-limit"

interface Message {
  key: string
  role: string
  content: string
  contentType?: "text" | "image"
  imageUrl?: string | null
  isNew?: boolean
}

interface ConversationMessagePayload {
  id?: number | string
  senderType: string
  body: string
  contentType?: "text" | "image"
  imageUrl?: string | null
  createdAt?: string
}

interface Conversation {
  id: number
  status: string
}

interface ConversationSummary {
  id: number
  isPinned: boolean
  lastMessageAt: string
  lastMessageBody: string | null
  messageCount: number
}

export default function Home() {
  const { data: session } = useSession()
  const [guestId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null

    const existingGuestId = window.sessionStorage.getItem("megpt-guest-id")
    if (existingGuestId) {
      return existingGuestId
    }

    const nextGuestId = crypto.randomUUID().replace(/-/g, "")
    window.sessionStorage.setItem("megpt-guest-id", nextGuestId)
    return nextGuestId
  })
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [composerNotice, setComposerNotice] = useState<string | null>(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [conversationId, setConversationId] = useState<number | null>(null)
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [conversations, setConversations] = useState<ConversationSummary[]>([])
  const [chatInputFocusToken, setChatInputFocusToken] = useState(0)

  const isAwaitingReply = conversation?.status === "awaiting_admin"
  const inputDisabled = isLoading || isAwaitingReply
  const guestHeaders: Record<string, string> | undefined = guestId
    ? { "x-guest-id": guestId }
    : undefined
  const jsonHeaders: Record<string, string> = guestId
    ? {
        "Content-Type": "application/json",
        "x-guest-id": guestId,
      }
    : { "Content-Type": "application/json" }
  const sidebarChats = conversations.map((item) => ({
    id: item.id,
    title:
      item.lastMessageBody?.slice(0, 36) ||
      (item.messageCount > 0 ? "Conversation" : "New chat"),
    date: getConversationDateLabel(item.lastMessageAt),
    pinned: item.isPinned,
  }))

  function toUiMessage(message: ConversationMessagePayload, isNew = false): Message {
    return {
      key: getMessageKey(message),
      role: message.senderType === "user" ? "user" : "assistant",
      content: message.body,
      contentType: message.contentType ?? "text",
      imageUrl: message.imageUrl ?? null,
      isNew,
    }
  }

  useEffect(() => {
    if (!session && !guestId) return

    const headers = guestId ? { "x-guest-id": guestId } : undefined

    async function loadConversation(activeId?: number | null) {
      const search = activeId ? `?conversationId=${activeId}` : ""
      const response = await fetch(`/api/conversation${search}`, {
        cache: "no-store",
        headers,
      })
      if (!response.ok) return
      const data = await response.json()
      setComposerNotice(null)
      setConversations(data.conversations)
      setConversationId(data.activeConversation?.id ?? null)
      setConversation(data.activeConversation)
      setMessages(data.messages.map((message: ConversationMessagePayload) => toUiMessage(message)))
    }

    loadConversation()
  }, [guestId, session])

  useEffect(() => {
    if ((!session && !guestId) || !conversationId) return

    const es = new EventSource(`/api/sse?conversationId=${conversationId}`)
    es.onmessage = (e) => {
      const data = JSON.parse(e.data)
      const nextMessage = toUiMessage(data.message, true)
      setMessages((prev) =>
        prev.some((message) => message.key === nextMessage.key)
          ? prev
          : [...prev, nextMessage]
      )
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
  }, [conversationId, guestId, session])

  async function handleSend(text: string) {
    setMessages((prev) => [
      ...prev,
      {
        key: `temp-user:${Date.now()}:${text}`,
        role: "user",
        content: text,
      },
    ])
    setIsLoading(true)
    setComposerNotice(null)

    const response = await fetch("/api/conversation/messages", {
      method: "POST",
      headers: jsonHeaders,
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
      const existingConversation = prev.find(
        (item) => item.id === data.conversation.id
      )
      const next = prev.filter((item) => item.id !== data.conversation.id)
      return [
        {
          id: data.conversation.id,
          isPinned: existingConversation?.isPinned ?? false,
          lastMessageAt: new Date().toISOString(),
          lastMessageBody: text,
          messageCount:
            (existingConversation?.messageCount ?? 0) + 1,
        },
        ...next,
      ]
    })
  }

  async function handleNewChat() {
    const response = await fetch("/api/conversation", {
      method: "POST",
      headers: jsonHeaders,
    })

    if (!response.ok) return

    const data = await response.json()
    setComposerNotice(null)
    setConversations(data.conversations)
    setConversationId(data.conversation.id)
    setConversation(data.conversation)
    setMessages([])
    setIsLoading(false)
    setChatInputFocusToken((currentToken) => currentToken + 1)
  }

  async function handleSelectConversation(nextConversationId: number) {
    if (!session && !guestId) return

    const response = await fetch(`/api/conversation?conversationId=${nextConversationId}`, {
      cache: "no-store",
      headers: guestHeaders,
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
    if (!session && !guestId) return

    const response = await fetch(`/api/conversation/${conversationToDeleteId}`, {
      method: "DELETE",
      headers: guestHeaders,
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

  async function handleTogglePinConversation(conversationToPinId: number) {
    if (!session && !guestId) return

    const targetConversation = conversations.find(
      (item) => item.id === conversationToPinId
    )
    if (!targetConversation) return

    const response = await fetch(`/api/conversation/${conversationToPinId}`, {
      method: "PATCH",
      headers: jsonHeaders,
      body: JSON.stringify({ pinned: !targetConversation.isPinned }),
    })

    if (!response.ok) return

    const data = await response.json()
    setConversations(data.conversations)
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        conversations={sidebarChats}
        activeConversationId={conversationId}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
        onDeleteConversation={handleDeleteConversation}
        onTogglePinConversation={handleTogglePinConversation}
      />

      <main className="flex h-screen flex-1 flex-col overflow-hidden">
        <ChatHeader
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          onNewChat={handleNewChat}
          hasMessages={messages.length > 0}
        />

        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <HeroPrompt />
            </div>
          ) : (
            <ChatMessages messages={messages} isLoading={isLoading} />
          )}
        </div>

        <div className="pb-4">
          <ChatInput
            onSend={handleSend}
            disabled={inputDisabled}
            placeholder={isAwaitingReply ? "MeGPT is still working..." : "Ask anything"}
            maxLength={MESSAGE_MAX_CHARS}
            helperText={composerNotice ?? "MeGPT can make mistakes. Check important info."}
            focusToken={chatInputFocusToken}
          />
          <FooterDisclosure />
        </div>
      </main>
    </div>
  )
}

function FooterDisclosure() {
  return (
    <p className="px-6 text-center text-xs leading-5 text-muted-foreground">
      By messaging MeGPT, a human, you agree to our{" "}
      <Link
        href="/terms"
        className="underline underline-offset-2 hover:text-foreground"
      >
        Terms
      </Link>{" "}
      and have read our{" "}
      <Link
        href="/privacy"
        className="underline underline-offset-2 hover:text-foreground"
      >
        Privacy Policy
      </Link>
      .
    </p>
  )
}

function getConversationDateLabel(isoDate: string) {
  const date = new Date(isoDate)
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfYesterday = new Date(startOfToday)
  startOfYesterday.setDate(startOfYesterday.getDate() - 1)
  const startOfSevenDays = new Date(startOfToday)
  startOfSevenDays.setDate(startOfSevenDays.getDate() - 7)

  if (date >= startOfToday) {
    return "Today"
  }

  if (date >= startOfYesterday) {
    return "Yesterday"
  }

  if (date >= startOfSevenDays) {
    return "Previous 7 Days"
  }

  return "Older"
}

function getMessageKey(message: ConversationMessagePayload) {
  if (typeof message.id === "number" && message.id > 0) {
    return `db:${message.id}`
  }

  if (typeof message.id === "string" && message.id.length > 0) {
    return `db:${message.id}`
  }

  return [
    message.senderType,
    message.createdAt ?? "",
    message.contentType ?? "text",
    message.imageUrl ?? "",
    message.body,
  ].join(":")
}
