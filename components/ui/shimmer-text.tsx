"use client"

import { cn } from "@/lib/utils"

interface ShimmerTextProps {
  children: React.ReactNode
  className?: string
  duration?: number
  delay?: number
}

export function ShimmerText({
  children,
  className,
  duration = 1.5,
  delay = 0,
}: ShimmerTextProps) {
  return (
    <span
      className={cn("spell-shimmer-text inline-block font-medium", className)}
      style={
        {
          animationDuration: `${duration}s`,
          animationDelay: `${delay}s`,
        } as React.CSSProperties
      }
    >
      {children}
    </span>
  )
}
