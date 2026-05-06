"use client"

import type { ReactNode } from "react"
import { motion, useReducedMotion, type Variants } from "motion/react"

interface BlurRevealProps {
  children: ReactNode
  delay?: number
  duration?: number
  className?: string
  trigger?: boolean
}

const variants: Variants = {
  hidden: { opacity: 0, filter: "blur(10px)", y: 6 },
  visible: { opacity: 1, filter: "blur(0px)", y: 0 },
}

export function BlurReveal({
  children,
  delay = 0,
  duration = 0.6,
  className,
  trigger = true,
}: BlurRevealProps) {
  const shouldReduceMotion = useReducedMotion()
  const shouldAnimate = trigger && !shouldReduceMotion

  return (
    <motion.div
      initial={shouldAnimate ? "hidden" : false}
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
  const shouldReduceMotion = useReducedMotion()
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
            initial={shouldReduceMotion ? false : "hidden"}
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
