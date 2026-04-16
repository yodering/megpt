"use client"

import { useEffect, useState } from "react"
import { ChatMessage } from "@/components/chat-message"

interface Message {
  key: string
  role: string
  content: string
  contentType?: "text" | "image"
  imageUrl?: string | null
  imageUrls?: string[]
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
  const renderedMessages = groupRenderableMessages(messages)
  const lastMessage = renderedMessages[renderedMessages.length - 1]
  const showThinkingState = Boolean(isLoading && lastMessage?.role === "user")

  return (
    <div className="min-h-full">
      <div className="mx-auto max-w-3xl px-3 py-3 sm:px-4 sm:py-4">
        {renderedMessages.map((msg, i) => (
          <ChatMessage
            key={msg.key ?? i}
            role={msg.role === "user" ? "user" : "assistant"}
            content={msg.content}
            contentType={msg.contentType}
            imageUrl={msg.imageUrl}
            imageUrls={msg.imageUrls}
            isNew={Boolean(msg.isNew)}
          />
        ))}

        {showThinkingState ? (
          <ThinkingIndicator />
        ) : null}
      </div>
    </div>
  )
}

function groupRenderableMessages(messages: Message[]) {
  const grouped: Message[] = []

  for (const message of messages) {
    const previousMessage = grouped[grouped.length - 1]
    const isImageOnlyAssistantMessage =
      message.role !== "user" &&
      message.contentType === "image" &&
      !message.content &&
      Boolean(message.imageUrl)
    const shouldAppendToPrevious =
      isImageOnlyAssistantMessage &&
      previousMessage?.role === message.role &&
      previousMessage.contentType === "image" &&
      !previousMessage.content

    if (shouldAppendToPrevious) {
      previousMessage.imageUrls = [
        ...(previousMessage.imageUrls?.length
          ? previousMessage.imageUrls
          : previousMessage.imageUrl
            ? [previousMessage.imageUrl]
            : []),
        ...(message.imageUrl ? [message.imageUrl] : []),
      ]
      previousMessage.key = `${previousMessage.key}:${message.key}`
      previousMessage.isNew = previousMessage.isNew || message.isNew
      continue
    }

    grouped.push({
      ...message,
      imageUrls: message.imageUrl ? [message.imageUrl] : undefined,
    })
  }

  return grouped
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
