"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import {
  Copy,
  RotateCcw,
  ThumbsDown,
  ThumbsUp,
  Volume2,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { BlurRevealWord } from "@/components/ui/blur-reveal"
import { ShimmerText } from "@/components/ui/shimmer-text"
import { cn } from "@/lib/utils"

interface ChatMessageProps {
  role: "user" | "assistant"
  content: string
  contentType?: "text" | "image"
  imageUrl?: string | null
  imageUrls?: string[]
  isStreaming?: boolean
  isNew?: boolean
  streamingLabel?: string
  onImageLoad?: () => void
}

export function ChatMessage({
  role,
  content,
  contentType = "text",
  imageUrl,
  imageUrls = [],
  isStreaming,
  isNew = false,
  streamingLabel = "Thinking",
  onImageLoad,
}: ChatMessageProps) {
  const [expandedImageUrl, setExpandedImageUrl] = useState<string | null>(null)
  const renderedImageUrls =
    imageUrls.length > 0
      ? imageUrls.filter(Boolean)
      : imageUrl
        ? [imageUrl]
        : []

  useEffect(() => {
    if (!expandedImageUrl) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setExpandedImageUrl(null)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [expandedImageUrl])

  const handleImageElement = (element: HTMLImageElement | null) => {
    if (element?.complete) {
      window.requestAnimationFrame(() => {
        onImageLoad?.()
      })
    }
  }

  return (
    <>
      <div
        className={cn(
          "group flex gap-3 py-3 sm:gap-4 sm:py-4",
          role === "user" ? "justify-end" : "justify-start"
        )}
      >
        <div
          className={cn(
            "flex max-w-[88%] flex-col gap-2 sm:max-w-[78%] lg:max-w-[70%]",
            role === "user" ? "items-end" : "items-start"
          )}
        >
          <div
            className={cn(
              "w-full rounded-[1.5rem] px-4 py-2.5 sm:px-5",
              role === "user"
                ? "bg-card text-card-foreground"
                : "bg-transparent text-foreground"
            )}
          >
            {contentType === "image" && renderedImageUrls.length > 0 ? (
              <>
                <div
                  className={cn(
                    "mb-3 grid gap-3",
                    renderedImageUrls.length > 1 ? "grid-cols-2" : "grid-cols-1"
                  )}
                >
                  {renderedImageUrls.map((nextImageUrl, index) => (
                    <button
                      key={`${nextImageUrl}:${index}`}
                      type="button"
                      className="group/image block overflow-hidden rounded-2xl border border-border text-left"
                      onClick={() => setExpandedImageUrl(nextImageUrl)}
                      title="Open image"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        ref={handleImageElement}
                        src={nextImageUrl}
                        alt={content || "Operator reply image"}
                        className="max-h-[22rem] w-full object-cover transition-transform duration-200 group-hover/image:scale-[1.01] sm:max-h-[28rem]"
                        onLoad={onImageLoad}
                        onError={onImageLoad}
                      />
                    </button>
                  ))}
                </div>
                {content ? (
                  <p className="whitespace-pre-wrap break-words text-[15px] leading-relaxed">
                    {content}
                  </p>
                ) : null}
              </>
            ) : isStreaming ? (
              <ShimmerText
                className="text-[15px] leading-relaxed text-muted-foreground"
                duration={1.7}
              >
                {streamingLabel}
              </ShimmerText>
            ) : role === "assistant" && isNew ? (
              <AnimatedAssistantText content={content} />
            ) : (
              <p className="whitespace-pre-wrap break-words text-[15px] leading-relaxed">
                {content}
              </p>
            )}
          </div>

          {role === "assistant" && !isStreaming && contentType !== "image" && content ? (
            <div className="flex items-center gap-1 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-md text-muted-foreground hover:text-foreground"
              >
                <Volume2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-md text-muted-foreground hover:text-foreground"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-md text-muted-foreground hover:text-foreground"
              >
                <ThumbsUp className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-md text-muted-foreground hover:text-foreground"
              >
                <ThumbsDown className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-md text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          ) : null}
        </div>
      </div>

      {typeof document !== "undefined" && expandedImageUrl
        ? createPortal(
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                  setExpandedImageUrl(null)
                }
              }}
            >
              <button
                type="button"
                className="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-black/45 text-white hover:bg-black/60"
                onClick={() => setExpandedImageUrl(null)}
                title="Close image"
              >
                <X className="h-5 w-5" />
              </button>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={expandedImageUrl}
                alt={content || "Expanded chat image"}
                className="max-h-[88vh] max-w-[94vw] rounded-2xl object-contain shadow-[0_24px_70px_rgba(0,0,0,0.45)]"
              />
            </div>,
            document.body
          )
        : null}
    </>
  )
}

function AnimatedAssistantText({ content }: { content: string }) {
  const lines = content.split("\n")

  return (
    <div className="space-y-1">
      {lines.map((line, index) =>
        line.length === 0 ? (
          <div key={`line-${index}`} className="h-4" />
        ) : (
          <p
            key={`line-${index}`}
            className="whitespace-pre-wrap text-[15px] leading-relaxed"
          >
            <BlurRevealWord text={line} delay={index * 0.08} staggerDelay={0.03} />
          </p>
        )
      )}
    </div>
  )
}
