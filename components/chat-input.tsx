"use client"

import { useEffect, useRef, useState, type FormEvent } from "react"
import { ArrowUp, Globe, Lightbulb, Paperclip } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
  placeholder?: string
  helperText?: string
  maxLength?: number
  focusToken?: number
}

export function ChatInput({
  onSend,
  disabled,
  placeholder = "Ask anything",
  helperText = "MeGPT can make mistakes. Check important info.",
  maxLength,
  focusToken,
}: ChatInputProps) {
  const [value, setValue] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!textareaRef.current) return

    textareaRef.current.style.height = "auto"
    textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 220)}px`
  }, [value])

  useEffect(() => {
    if (typeof focusToken !== "number" || disabled) return

    const textarea = textareaRef.current
    if (!textarea) return

    const frame = window.requestAnimationFrame(() => {
      textarea.focus()
      const cursorPosition = textarea.value.length
      textarea.setSelectionRange(cursorPosition, cursorPosition)
    })

    return () => window.cancelAnimationFrame(frame)
  }, [disabled, focusToken])

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue("")
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-4">
      <form
        onSubmit={handleSubmit}
        className="relative flex flex-col rounded-3xl border border-border bg-card shadow-sm"
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          maxLength={maxLength}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              handleSubmit(e)
            }
          }}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className={cn(
            "min-h-[52px] max-h-[200px] w-full resize-none bg-transparent px-4 py-4 pr-14 text-[15px] text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50"
          )}
        />
        <div className="flex items-center justify-between px-3 pb-3">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full text-muted-foreground hover:bg-accent hover:text-foreground"
              title="Attachments are not available yet"
            >
              <Paperclip className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 rounded-full px-3 text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <Globe className="h-4 w-4" />
              <span className="text-sm">Search</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 rounded-full px-3 text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <Lightbulb className="h-4 w-4" />
              <span className="text-sm">{disabled ? "Pending" : "Reason"}</span>
            </Button>
          </div>
          <Button
            size="icon"
            type="submit"
            disabled={!value.trim() || disabled}
            className={cn(
              "h-8 w-8 rounded-full transition-colors",
              value.trim() && !disabled
                ? "bg-foreground text-background hover:bg-foreground/90"
                : "bg-muted text-muted-foreground"
            )}
          >
            <ArrowUp className="h-5 w-5" />
          </Button>
        </div>
      </form>

      <p className="mt-2 text-center text-xs text-muted-foreground">
        {helperText}
        {typeof maxLength === "number" ? ` ${value.length}/${maxLength}` : ""}
      </p>
    </div>
  )
}
