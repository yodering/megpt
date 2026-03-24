"use client"

import { useEffect, useState } from "react"
import { ChatInput } from "@/components/chat-input"
import { ChatMessages } from "@/components/chat-messages"
import type { ConversationMessage, ConversationSummary } from "@/lib/conversations"

type ConversationPayload = {
  conversation: ConversationSummary
  messages: ConversationMessage[]
}

interface AdminInboxProps {
  initialConversations: ConversationSummary[]
  initialConversation: ConversationPayload | null
}

export function AdminInbox({
  initialConversations,
  initialConversation,
}: AdminInboxProps) {
  const [filter, setFilter] = useState<"all" | "awaiting_admin" | "awaiting_user">(
    "awaiting_admin"
  )
  const [conversations, setConversations] = useState(initialConversations)
  const [activeConversationId, setActiveConversationId] = useState<number | null>(
    initialConversation?.conversation.id ?? initialConversations[0]?.id ?? null
  )
  const [activeConversation, setActiveConversation] =
    useState<ConversationPayload | null>(initialConversation)
  const [isSending, setIsSending] = useState(false)

  useEffect(() => {
    async function refreshList() {
      const response = await fetch("/api/admin/conversations", { cache: "no-store" })
      if (!response.ok) return
      const data = await response.json()
      setConversations(data.conversations)
    }

    refreshList()
    const intervalId = window.setInterval(refreshList, 5000)
    return () => window.clearInterval(intervalId)
  }, [])

  useEffect(() => {
    if (!activeConversationId) return

    async function loadConversation() {
      const response = await fetch(`/api/admin/conversations/${activeConversationId}`, {
        cache: "no-store",
      })
      if (!response.ok) return
      const data = await response.json()
      setActiveConversation(data)
    }

    loadConversation()
    const intervalId = window.setInterval(loadConversation, 3000)
    return () => window.clearInterval(intervalId)
  }, [activeConversationId])

  async function handleReply(text: string) {
    if (!activeConversationId) return

    setIsSending(true)
    try {
      const response = await fetch(
        `/api/admin/conversations/${activeConversationId}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        }
      )

      if (!response.ok) {
        return
      }

      const data = await response.json()
      setActiveConversation((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          conversation: {
            ...prev.conversation,
            status: "awaiting_user",
            lastMessageAt: data.message.createdAt,
            lastMessageBody: data.message.body,
            messageCount: prev.conversation.messageCount + 1,
          },
          messages: [...prev.messages, data.message],
        }
      })
      setConversations((prev) =>
        prev.map((conversation) =>
          conversation.id === activeConversationId
            ? {
                ...conversation,
                status: "awaiting_user",
                lastMessageAt: data.message.createdAt,
                lastMessageBody: data.message.body,
                messageCount: conversation.messageCount + 1,
              }
            : conversation
        )
      )
    } finally {
      setIsSending(false)
    }
  }

  const messageItems =
    activeConversation?.messages.map((message) => ({
      role: message.senderType === "user" ? "assistant" : "user",
      content: message.body,
    })) ?? []

  const filteredConversations = conversations.filter((conversation) => {
    if (filter === "all") return true
    return conversation.status === filter
  })

  return (
    <div className="grid min-h-[calc(100vh-81px)] grid-cols-1 md:grid-cols-[320px_minmax(0,1fr)]">
      <aside className="border-r border-[#d8d1c4] bg-[#f7f3eb]">
        <div className="border-b border-[#d8d1c4] px-5 py-4">
          <p className="text-sm font-medium">Conversations</p>
          <p className="text-xs text-[#6a6256]">
            {conversations.length} total threads
          </p>
          <div className="mt-3 flex gap-2">
            {[
              ["awaiting_admin", "Needs reply"],
              ["awaiting_user", "Waiting"],
              ["all", "All"],
            ].map(([value, label]) => (
              <button
                key={value}
                onClick={() =>
                  setFilter(value as "all" | "awaiting_admin" | "awaiting_user")
                }
                className={`rounded-full px-3 py-1.5 text-xs transition-colors ${
                  filter === value
                    ? "bg-[#161616] text-white"
                    : "bg-[#e7dece] text-[#5a4f3d] hover:bg-[#ddd2c0]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col">
          {filteredConversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => setActiveConversationId(conversation.id)}
              className={`border-b border-[#ece5d8] px-5 py-4 text-left transition-colors ${
                activeConversationId === conversation.id
                  ? "bg-white"
                  : "hover:bg-[#f1ebdd]"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="truncate text-sm font-medium text-[#161616]">
                  {conversation.userName || conversation.userEmail}
                </p>
                <span className="rounded-full bg-[#e7dece] px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-[#5a4f3d]">
                  {conversation.status}
                </span>
              </div>
              <p className="mt-1 truncate text-xs text-[#6a6256]">
                {conversation.userEmail || "No email"}
              </p>
              <p className="mt-2 line-clamp-2 text-sm text-[#40382d]">
                {conversation.lastMessageBody || "No messages yet"}
              </p>
            </button>
          ))}
          {filteredConversations.length === 0 && (
            <div className="px-5 py-6 text-sm text-[#6a6256]">
              No conversations in this filter.
            </div>
          )}
        </div>
      </aside>

      <section className="flex min-h-0 flex-col bg-[#fffdf8]">
        {activeConversation ? (
          <>
            <div className="border-b border-[#ece5d8] px-6 py-4">
              <p className="text-lg font-semibold">
                {activeConversation.conversation.userName ||
                  activeConversation.conversation.userEmail}
              </p>
              <p className="text-sm text-[#6a6256]">
                {activeConversation.conversation.userEmail}
              </p>
            </div>

            <div className="flex min-h-0 flex-1 flex-col">
              <ChatMessages messages={messageItems} />
              <ChatInput onSend={handleReply} disabled={isSending} />
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center px-6 text-center text-[#6a6256]">
            No conversations yet.
          </div>
        )}
      </section>
    </div>
  )
}
