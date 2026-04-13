"use client"

import { motion, type Variants } from "motion/react"

interface BlurRevealProps {
  children: React.ReactNode
  delay?: number
  duration?: number
  className?: string
}

const variants: Variants = {
  hidden: { opacity: 0, filter: "blur(10px)", y: 5 },
  visible: { opacity: 1, filter: "blur(0px)", y: 0 },
}

export function BlurReveal({
  children,
  delay = 0,
  duration = 0.6,
  className,
}: BlurRevealProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={variants}
      transition={{ duration, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

interface BlurRevealWordProps {
  text: string
  delay?: number
  staggerDelay?: number
  className?: string
}

export function BlurRevealWord({
  text,
  delay = 0,
  staggerDelay = 0.04,
  className,
}: BlurRevealWordProps) {
  const segments = text.split(/(\s+)/).filter(Boolean)

  return (
    <span className={className}>
      {segments.map((segment, i) =>
        /\s+/.test(segment) ? (
          <span key={`space-${i}`} style={{ whiteSpace: "pre-wrap" }}>
            {segment}
          </span>
        ) : (
          <motion.span
            key={`word-${i}`}
            initial="hidden"
            animate="visible"
            variants={variants}
            transition={{
              duration: 0.4,
              delay: delay + i * staggerDelay,
              ease: "easeOut",
            }}
            className="inline-block"
          >
            {segment}
          </motion.span>
        )
      )}
    </span>
  )
}
