"use client"

import { useEffect, useRef, useState } from "react"
import { ChatMessage } from "@/components/chat-message"

interface Message {
  key: string
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

const THINKING_LABELS = [
  "Thinking",
  "Reviewing context",
  "Connecting details",
  "Drafting response",
  "Checking the wording",
]

export function ChatMessages({ messages, isLoading }: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isLoading])

  const lastMessage = messages[messages.length - 1]
  const showThinkingState = Boolean(isLoading && lastMessage?.role === "user")

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-3xl px-4 py-4">
        {messages.map((msg, i) => (
          <ChatMessage
            key={msg.key ?? i}
            role={msg.role === "user" ? "user" : "assistant"}
            content={msg.content}
            contentType={msg.contentType}
            imageUrl={msg.imageUrl}
            isNew={Boolean(msg.isNew)}
          />
        ))}

        {showThinkingState ? (
          <ThinkingIndicator />
        ) : null}

        <div ref={bottomRef} />
      </div>
    </div>
  )
}

function ThinkingIndicator() {
  const [thinkingLabelIndex, setThinkingLabelIndex] = useState(0)

  useEffect(() => {
    const interval = window.setInterval(() => {
      setThinkingLabelIndex((currentIndex) =>
        (currentIndex + 1) % THINKING_LABELS.length
      )
    }, 1900)

    return () => window.clearInterval(interval)
  }, [])

  return (
    <ChatMessage
      role="assistant"
      content=""
      isStreaming
      streamingLabel={THINKING_LABELS[thinkingLabelIndex]}
    />
  )
}
