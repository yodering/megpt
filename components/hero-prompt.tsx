"use client"

import { useState } from "react"

const rotatingPrompts = [
  "Ready when you are.",
  "What can I help with?",
  "Ask anything.",
  "Where should we start?",
  "What are we solving?",
  "Tell me what you need.",
  "How can I help today?",
  "What should we figure out?",
  "What are you working on?",
  "What are you trying to solve?",
  "Where do you want to begin?",
  "What needs an answer?",
  "What are you thinking through?",
  "What would help right now?",
]

export function HeroPrompt() {
  const [prompt] = useState(
    () => rotatingPrompts[Math.floor(Math.random() * rotatingPrompts.length)]
  )

  return (
    <div className="flex h-full flex-col items-center justify-center">
      <div className="mb-6 flex min-h-16 items-center justify-center px-4 text-center sm:mb-8 sm:px-6">
        <h1 className="max-w-none whitespace-nowrap text-[clamp(1.35rem,2.8vw,2.15rem)] font-normal tracking-[-0.04em] text-foreground">
          {prompt}
        </h1>
      </div>
    </div>
  )
}
