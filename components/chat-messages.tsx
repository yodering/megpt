"use client"

import { useEffect, useRef } from "react"
import { BlurRevealWord } from "@/components/ui/blur-reveal"
import { Spinner } from "@/components/ui/spinner"

interface Message {
  role: string
  content: string
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

  return (
    <div className="flex-1 overflow-y-auto px-4">
      <div className="max-w-[672px] mx-auto py-6 flex flex-col gap-6">
        {messages.map((msg, i) => (
          <div key={i}>
            {msg.role === "user" ? (
              <div className="flex justify-end">
                <div className="bg-[#f4f4f4] rounded-3xl px-5 py-3 max-w-[85%] text-[#0d0d0d]">
                  {msg.content}
                </div>
              </div>
            ) : (
              <div className="flex justify-start">
                <div className="max-w-[85%] text-[#0d0d0d] leading-relaxed">
                  {msg.isNew ? (
                    <BlurRevealWord text={msg.content} />
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <Spinner />
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  )
}
