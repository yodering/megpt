"use client"

import Link from "next/link"
import { useSession } from "next-auth/react"
import { useEffect, useRef, useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { ChatHeader } from "@/components/chat-header"
import { ChatInput, type ComposerPayload } from "@/components/chat-input"
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
  const { data: session, status: sessionStatus } = useSession()
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
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [isMobileViewport, setIsMobileViewport] = useState(false)
  const [conversationId, setConversationId] = useState<number | null>(null)
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [conversations, setConversations] = useState<ConversationSummary[]>([])
  const [chatInputFocusToken, setChatInputFocusToken] = useState(0)
  const conversationRequestIdRef = useRef(0)

  const identityKey =
    session?.user?.email ??
    (sessionStatus === "unauthenticated" && guestId ? `guest:${guestId}` : null)
  const identityReady = identityKey !== null
  const isAwaitingReply = conversation?.status === "awaiting_admin"
  const inputDisabled = !identityReady || isLoading || isAwaitingReply
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

  function beginConversationRequest() {
    conversationRequestIdRef.current += 1
    return conversationRequestIdRef.current
  }

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)")
    const updateViewportMode = (event?: MediaQueryList | MediaQueryListEvent) => {
      const mobile = event?.matches ?? mediaQuery.matches
      setIsMobileViewport(mobile)

      if (!mobile) {
        setMobileSidebarOpen(false)
      }
    }

    updateViewportMode(mediaQuery)
    mediaQuery.addEventListener("change", updateViewportMode)
    return () => mediaQuery.removeEventListener("change", updateViewportMode)
  }, [])

  useEffect(() => {
    const root = document.documentElement

    const updateViewportHeight = () => {
      const nextHeight = window.visualViewport?.height ?? window.innerHeight
      root.style.setProperty("--app-height", `${nextHeight}px`)
    }

    updateViewportHeight()
    window.addEventListener("resize", updateViewportHeight)
    window.visualViewport?.addEventListener("resize", updateViewportHeight)
    window.visualViewport?.addEventListener("scroll", updateViewportHeight)

    return () => {
      window.removeEventListener("resize", updateViewportHeight)
      window.visualViewport?.removeEventListener("resize", updateViewportHeight)
      window.visualViewport?.removeEventListener("scroll", updateViewportHeight)
      root.style.removeProperty("--app-height")
    }
  }, [])

  useEffect(() => {
    if (!identityReady) return

    const requestId = beginConversationRequest()
    const headers =
      session?.user?.email || !guestId
        ? undefined
        : { "x-guest-id": guestId }

    async function loadConversation(activeId?: number | null) {
      const search = activeId ? `?conversationId=${activeId}` : ""
      const response = await fetch(`/api/conversation${search}`, {
        cache: "no-store",
        headers,
      })
      if (!response.ok) return
      const data = await response.json()
      if (requestId !== conversationRequestIdRef.current) return
      setComposerNotice(null)
      setConversations(data.conversations)
      setConversationId(data.activeConversation?.id ?? null)
      setConversation(data.activeConversation)
      setMessages(data.messages.map((message: ConversationMessagePayload) => toUiMessage(message)))
    }

    loadConversation()
  }, [guestId, identityReady, session?.user?.email])

  useEffect(() => {
    if (!identityReady || !conversationId) return

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
  }, [conversationId, identityReady])

  async function handleSend({ text, image }: ComposerPayload) {
    if (!identityReady) return false
    if (!text && !image) return false

    const tempMessageKey = `temp-user:${Date.now()}:${text}`
    const requestId = beginConversationRequest()
    const tempImageUrl = image ? URL.createObjectURL(image) : null

    setMessages((prev) => [
      ...prev,
      {
        key: tempMessageKey,
        role: "user",
        content: text,
        contentType: image ? "image" : "text",
        imageUrl: tempImageUrl,
      },
    ])
    setIsLoading(true)
    setComposerNotice(null)

    let response: Response

    try {
      response = await fetch(
        "/api/conversation/messages",
        image
          ? {
              method: "POST",
              headers: guestId ? { "x-guest-id": guestId } : undefined,
              body: buildMessageFormData({ text, image, conversationId }),
            }
          : {
              method: "POST",
              headers: jsonHeaders,
              body: JSON.stringify({ text, conversationId }),
            }
      )
    } catch {
      if (requestId !== conversationRequestIdRef.current) {
        if (tempImageUrl) {
          URL.revokeObjectURL(tempImageUrl)
        }
        return false
      }

      setIsLoading(false)
      setComposerNotice("Your message could not be sent right now.")
      setMessages((prev) =>
        prev.filter((message) => message.key !== tempMessageKey)
      )
      if (tempImageUrl) {
        URL.revokeObjectURL(tempImageUrl)
      }
      return false
    }

    if (!response.ok) {
      const data = await response.json().catch(() => null)
      if (requestId !== conversationRequestIdRef.current) {
        if (tempImageUrl) {
          URL.revokeObjectURL(tempImageUrl)
        }
        return false
      }
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
      setMessages((prev) =>
        prev.filter((message) => message.key !== tempMessageKey)
      )
      if (tempImageUrl) {
        URL.revokeObjectURL(tempImageUrl)
      }
      return false
    }

    const data = await response.json()
    if (requestId !== conversationRequestIdRef.current) {
      if (tempImageUrl) {
        URL.revokeObjectURL(tempImageUrl)
      }
      return false
    }

    const confirmedUserMessage = toUiMessage(data.message)
    setComposerNotice(null)
    setMessages((prev) => [
      ...prev.filter(
        (message) =>
          message.key !== tempMessageKey &&
          message.key !== confirmedUserMessage.key
      ),
      confirmedUserMessage,
    ])
    if (tempImageUrl) {
      URL.revokeObjectURL(tempImageUrl)
    }
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
          lastMessageBody: text || (image ? "[Image]" : null),
          messageCount:
            (existingConversation?.messageCount ?? 0) + 1,
        },
        ...next,
      ]
    })
    return true
  }

  async function handleNewChat() {
    if (!identityReady) return

    const requestId = beginConversationRequest()
    const response = await fetch("/api/conversation", {
      method: "POST",
      headers: jsonHeaders,
    })

    if (!response.ok) return

    const data = await response.json()
    if (requestId !== conversationRequestIdRef.current) return
    setComposerNotice(null)
    setConversations(data.conversations)
    setConversationId(data.conversation.id)
    setConversation(data.conversation)
    setMessages([])
    setIsLoading(false)
    setChatInputFocusToken((currentToken) => currentToken + 1)
    setMobileSidebarOpen(false)
  }

  async function handleSelectConversation(nextConversationId: number) {
    if (!identityReady) return

    const requestId = beginConversationRequest()

    const response = await fetch(`/api/conversation?conversationId=${nextConversationId}`, {
      cache: "no-store",
      headers: guestHeaders,
    })
    if (!response.ok) return

    const data = await response.json()
    if (requestId !== conversationRequestIdRef.current) return
    setComposerNotice(null)
    setConversations(data.conversations)
    setConversationId(data.activeConversation?.id ?? null)
    setConversation(data.activeConversation)
    setMessages(data.messages.map((message: ConversationMessagePayload) => toUiMessage(message)))
    setIsLoading(false)
    setMobileSidebarOpen(false)
  }

  async function handleDeleteConversation(conversationToDeleteId: number) {
    if (!identityReady) return

    const requestId = beginConversationRequest()

    const response = await fetch(`/api/conversation/${conversationToDeleteId}`, {
      method: "DELETE",
      headers: guestHeaders,
    })

    if (!response.ok) return

    const data = await response.json()
    if (requestId !== conversationRequestIdRef.current) return
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
    if (!identityReady) return

    const targetConversation = conversations.find(
      (item) => item.id === conversationToPinId
    )
    if (!targetConversation) return

    const requestId = beginConversationRequest()
    const response = await fetch(`/api/conversation/${conversationToPinId}`, {
      method: "PATCH",
      headers: jsonHeaders,
      body: JSON.stringify({ pinned: !targetConversation.isPinned }),
    })

    if (!response.ok) return

    const data = await response.json()
    if (requestId !== conversationRequestIdRef.current) return
    setConversations(data.conversations)
  }

  function handleToggleSidebar() {
    if (isMobileViewport) {
      setMobileSidebarOpen((currentState) => !currentState)
      return
    }

    setSidebarCollapsed((currentState) => !currentState)
  }

  return (
    <div
      className="flex bg-background"
      style={{ minHeight: "var(--app-height, 100dvh)" }}
    >
      <Sidebar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        onToggle={handleToggleSidebar}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        conversations={sidebarChats}
        activeConversationId={conversationId}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
        onDeleteConversation={handleDeleteConversation}
        onTogglePinConversation={handleTogglePinConversation}
      />

      <main
        className="safe-top flex flex-1 flex-col overflow-hidden"
        style={{ minHeight: "var(--app-height, 100dvh)" }}
      >
        <ChatHeader
          sidebarCollapsed={sidebarCollapsed}
          isMobileViewport={isMobileViewport}
          onToggleSidebar={handleToggleSidebar}
          onNewChat={handleNewChat}
          hasMessages={messages.length > 0}
        />

        <div className="momentum-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center px-4">
              <HeroPrompt />
            </div>
          ) : (
            <ChatMessages messages={messages} isLoading={isLoading} />
          )}
        </div>

        <div className="safe-bottom shrink-0 border-t border-border/60 bg-background/88 backdrop-blur-xl">
          <ChatInput
            onSend={handleSend}
            disabled={inputDisabled}
            placeholder={isAwaitingReply ? "MeGPT is still working..." : "Ask anything"}
            maxLength={MESSAGE_MAX_CHARS}
            helperText={composerNotice}
            focusToken={chatInputFocusToken}
          />
          <FooterDisclosure />
        </div>
      </main>
    </div>
  )
}

function buildMessageFormData({
  text,
  image,
  conversationId,
}: {
  text: string
  image: File
  conversationId: number | null
}) {
  const formData = new FormData()
  formData.append("text", text)
  formData.append("image", image)

  if (typeof conversationId === "number") {
    formData.append("conversationId", String(conversationId))
  }

  return formData
}

function FooterDisclosure() {
  return (
    <p className="mx-auto max-w-[30rem] px-6 text-center text-[10px] leading-4 text-muted-foreground/80 sm:text-[11px] sm:leading-4">
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
