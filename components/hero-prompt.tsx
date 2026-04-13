"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "motion/react"

const rotatingPrompts = [
  "What can I help with?",
  "Plan a weekend trip to Montreal",
  "Explain this code step by step",
  "Draft a crisp follow-up email",
  "Turn my rough notes into a summary",
  "Compare React Server Components and client components",
  "Outline a launch checklist for a new feature",
  "Help me write cleaner TypeScript",
  "Summarize a long thread into key actions",
  "Map out a study plan for the next two weeks",
  "Rewrite this paragraph so it sounds more confident",
  "Brainstorm app ideas I could build this weekend",
  "Break a big project into smaller next steps",
  "Help me prepare for a product design interview",
  "Turn meeting notes into a clear action list",
]

export function HeroPrompt() {
  const [activePromptIndex, setActivePromptIndex] = useState(0)

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActivePromptIndex((currentIndex) =>
        (currentIndex + 1) % rotatingPrompts.length
      )
    }, 6000)

    return () => window.clearInterval(interval)
  }, [])

  return (
    <div className="flex h-full flex-col items-center justify-center">
      <div className="mb-8 flex min-h-16 items-center justify-center px-6 text-center">
        <AnimatePresence mode="wait">
          <motion.h1
            key={rotatingPrompts[activePromptIndex]}
            initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -10, filter: "blur(6px)" }}
            transition={{ duration: 0.32, ease: "easeOut" }}
            className="text-2xl font-medium text-foreground"
          >
            {rotatingPrompts[activePromptIndex]}
          </motion.h1>
        </AnimatePresence>
      </div>
    </div>
  )
}
