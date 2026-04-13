"use client"

import { useState, useRef, useEffect } from "react"
import { ArrowUp, Paperclip, Globe, Lightbulb } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
    }
  }, [input])

  const handleSubmit = () => {
    if (input.trim() && !disabled) {
      onSend(input.trim())
      setInput("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-4">
      <div className="relative flex flex-col rounded-3xl bg-card border border-border shadow-sm">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything"
          disabled={disabled}
          rows={1}
          className={cn(
            "w-full resize-none bg-transparent px-4 py-4 pr-14 text-[15px] text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50",
            "min-h-[52px] max-h-[200px]"
          )}
        />
        <div className="flex items-center justify-between px-3 pb-3">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent"
            >
              <Paperclip className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 rounded-full px-3 text-muted-foreground hover:text-foreground hover:bg-accent gap-1.5"
            >
              <Globe className="h-4 w-4" />
              <span className="text-sm">Search</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 rounded-full px-3 text-muted-foreground hover:text-foreground hover:bg-accent gap-1.5"
            >
              <Lightbulb className="h-4 w-4" />
              <span className="text-sm">Reason</span>
            </Button>
          </div>
          <Button
            size="icon"
            onClick={handleSubmit}
            disabled={!input.trim() || disabled}
            className={cn(
              "h-8 w-8 rounded-full transition-colors",
              input.trim()
                ? "bg-foreground text-background hover:bg-foreground/90"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            <ArrowUp className="h-5 w-5" />
          </Button>
        </div>
      </div>
      <p className="text-center text-xs text-muted-foreground mt-2">
        ChatGPT can make mistakes. Check important info.
      </p>
    </div>
  )
}
