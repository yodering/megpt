"use client"

import { useEffect, useRef } from "react"
import { ChatMessage } from "@/components/chat-message"

interface Message {
  role: string
  content: string
  contentType?: "text" | "image"
  imageUrl?: string | null
  isNew?: boolean
}

interface ChatMessagesProps {
  messages: Message[]
  isLoading?: boolean
}

export function ChatMessages({ messages, isLoading }: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isLoading])

  const lastMessage = messages[messages.length - 1]

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-3xl px-4 py-4">
        {messages.map((msg, i) => (
          <ChatMessage
            key={i}
            role={msg.role === "user" ? "user" : "assistant"}
            content={msg.content}
            contentType={msg.contentType}
            imageUrl={msg.imageUrl}
          />
        ))}

        {isLoading && lastMessage?.role === "user" ? (
          <ChatMessage role="assistant" content="" isStreaming />
        ) : null}

        <div ref={bottomRef} />
      </div>
    </div>
  )
}
