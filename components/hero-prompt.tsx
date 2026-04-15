"use client"

import { useState } from "react"

const rotatingPrompts = [
  "Ready when you are.",
  "What can I help with?",
  "Ask anything.",
  "Start wherever you want.",
  "What are we working on?",
  "Tell me what you need.",
  "How can I help today?",
  "What should we figure out?",
  "What do you want to make progress on?",
  "What can I help you untangle?",
  "What are you trying to solve?",
  "What do you want to work through?",
  "Where do you want to begin?",
  "What needs a clearer answer?",
  "What are you thinking through?",
  "What would be useful right now?",
]

export function HeroPrompt() {
  const [prompt] = useState(
    () => rotatingPrompts[Math.floor(Math.random() * rotatingPrompts.length)]
  )

  return (
    <div className="flex h-full flex-col items-center justify-center">
      <div className="mb-6 flex min-h-16 items-center justify-center px-4 text-center sm:mb-8 sm:px-6">
        <h1 className="max-w-[18ch] text-[clamp(2rem,5vw,3.25rem)] font-medium tracking-[-0.04em] text-foreground">
          {prompt}
        </h1>
      </div>
    </div>
  )
}
