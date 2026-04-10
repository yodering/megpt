"use client"

import { useState, type FormEvent } from "react"
import { Plus, Mic, ArrowUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
  placeholder?: string
  helperText?: string
  maxLength?: number
}

export function ChatInput({
  onSend,
  disabled,
  placeholder = "Ask anything",
  helperText = "MeGPT can make mistakes. Check important info.",
  maxLength,
}: ChatInputProps) {
  const [value, setValue] = useState("")

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue("")
  }

  return (
    <div className="w-full flex flex-col items-center pb-4 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-[672px] bg-[#f4f4f4] rounded-3xl border border-[#e5e5e5] flex items-end px-3 py-2 gap-2 transition-colors focus-within:border-[#c5c5c5]"
      >
        <button
          type="button"
          className="p-2 rounded-full hover:bg-[#e5e5e5] transition-colors shrink-0 mb-0.5"
        >
          <Plus className="w-5 h-5 text-[#6e6e6e]" />
        </button>

        <textarea
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
          rows={1}
          className="flex-1 bg-transparent text-[#0d0d0d] text-base placeholder:text-[#9e9e9e] resize-none outline-none py-2 max-h-[200px]"
          style={{ fieldSizing: "content" } as React.CSSProperties}
        />

        <button
          type="button"
          className="p-2 rounded-full hover:bg-[#e5e5e5] transition-colors shrink-0 mb-0.5"
        >
          <Mic className="w-5 h-5 text-[#6e6e6e]" />
        </button>

        <button
          type="submit"
          disabled={!value.trim() || disabled}
          className={cn(
            "p-2 rounded-full shrink-0 mb-0.5 transition-colors",
            value.trim()
              ? "bg-[#0d0d0d] text-white hover:bg-[#2d2d2d]"
              : "bg-[#e5e5e5] text-[#b0b0b0] cursor-not-allowed"
          )}
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      </form>

      <p className="text-xs text-[#9e9e9e] mt-2 text-center">
        {helperText}
        {typeof maxLength === "number" ? ` ${value.length}/${maxLength}` : ""}
      </p>
    </div>
  )
}
