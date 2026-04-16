"use client"

import { Copy, RotateCcw, ThumbsDown, ThumbsUp, Volume2 } from "lucide-react"
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
}: ChatMessageProps) {
  const renderedImageUrls =
    imageUrls.length > 0
      ? imageUrls.filter(Boolean)
      : imageUrl
        ? [imageUrl]
        : []

  return (
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
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={`${nextImageUrl}:${index}`}
                    src={nextImageUrl}
                    alt={content || "Operator reply image"}
                    className="max-h-[22rem] w-full rounded-2xl border border-border object-cover sm:max-h-[28rem]"
                  />
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
