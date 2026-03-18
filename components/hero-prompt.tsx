"use client"

import { BlurReveal } from "@/components/ui/blur-reveal"

export function HeroPrompt() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <BlurReveal duration={0.8}>
        <h1 className="text-3xl font-semibold text-[#0d0d0d]">
          What can I help with?
        </h1>
      </BlurReveal>
    </div>
  )
}
