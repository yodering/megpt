"use client"

import { motion } from "motion/react"
import { cn } from "@/lib/utils"

interface SpinnerProps {
  size?: number
  className?: string
}

export function Spinner({ size = 20, className }: SpinnerProps) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="rounded-full bg-[#0d0d0d]"
          style={{ width: size / 4, height: size / 4 }}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.2,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  )
}
