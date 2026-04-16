"use client"

import { useEffect, useRef, useState, type FormEvent } from "react"
import { ArrowUp, Paperclip, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface ComposerPayload {
  text: string
  image: File | null
}

interface ChatInputProps {
  onSend: (payload: ComposerPayload) => Promise<boolean>
  disabled?: boolean
  placeholder?: string
  helperText?: string | null
  maxLength?: number
  focusToken?: number
  resetToken?: number
}

export function ChatInput({
  onSend,
  disabled,
  placeholder = "Ask anything",
  helperText = null,
  maxLength,
  focusToken,
  resetToken,
}: ChatInputProps) {
  const [value, setValue] = useState("")
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isComposerDisabled = disabled || isSubmitting

  useEffect(() => {
    if (!textareaRef.current) return

    textareaRef.current.style.height = "auto"
    textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 220)}px`
  }, [value])

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  useEffect(() => {
    if (typeof focusToken !== "number" || isComposerDisabled) return

    const textarea = textareaRef.current
    if (!textarea) return

    const frame = window.requestAnimationFrame(() => {
      textarea.focus()
      const cursorPosition = textarea.value.length
      textarea.setSelectionRange(cursorPosition, cursorPosition)
    })

    return () => window.cancelAnimationFrame(frame)
  }, [focusToken, isComposerDisabled])

  useEffect(() => {
    if (typeof resetToken !== "number") return

    setValue("")
    clearSelectedImage()
  }, [resetToken])

  function clearSelectedImage() {
    setSelectedImage(null)
    setPreviewUrl((currentPreviewUrl) => {
      if (currentPreviewUrl) {
        URL.revokeObjectURL(currentPreviewUrl)
      }

      return null
    })
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  async function submitComposer() {
    const trimmed = value.trim()
    if ((!trimmed && !selectedImage) || isComposerDisabled) return

    setIsSubmitting(true)

    try {
      const sent = await onSend({ text: trimmed, image: selectedImage })
      if (!sent) return

      setValue("")
      clearSelectedImage()
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    void submitComposer()
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-3 pb-3 sm:px-4 sm:pb-4">
      <form
        onSubmit={handleSubmit}
        className="relative flex flex-col rounded-[1.75rem] border border-border bg-card/96 shadow-sm backdrop-blur"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
          className="hidden"
          disabled={isComposerDisabled}
          onChange={(event) => {
            const nextFile = event.target.files?.[0] ?? null
            setPreviewUrl((currentPreviewUrl) => {
              if (currentPreviewUrl) {
                URL.revokeObjectURL(currentPreviewUrl)
              }

              return nextFile ? URL.createObjectURL(nextFile) : null
            })
            setSelectedImage(nextFile)
          }}
        />

        {selectedImage && previewUrl ? (
          <div className="px-3 pt-3 sm:px-4 sm:pt-4">
            <div className="inline-flex max-w-full items-start gap-3 rounded-2xl border border-border bg-background px-3 py-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt={selectedImage.name}
                className="h-16 w-16 rounded-xl border border-border object-cover"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {selectedImage.name}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {(selectedImage.size / (1024 * 1024)).toFixed(1)} MB
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                type="button"
                className="h-8 w-8 shrink-0 rounded-full text-muted-foreground hover:bg-accent hover:text-foreground"
                onClick={clearSelectedImage}
                title="Remove image"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : null}

        <div className="flex items-end gap-2 px-3 py-2.5 sm:px-4 sm:py-3">
          <Button
            variant="ghost"
            size="icon"
            type="button"
            className="h-9 w-9 shrink-0 rounded-full text-muted-foreground hover:bg-accent hover:text-foreground"
            title="Upload image"
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip className="h-5 w-5" />
          </Button>
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            maxLength={maxLength}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                void submitComposer()
              }
            }}
            placeholder={placeholder}
            disabled={isComposerDisabled}
            rows={1}
            className={cn(
              "min-h-[40px] max-h-[160px] w-full resize-none bg-transparent py-2 text-base text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50 sm:text-[15px]"
            )}
          />
          <Button
            size="icon"
            type="submit"
            disabled={(!value.trim() && !selectedImage) || isComposerDisabled}
            className={cn(
              "h-9 w-9 shrink-0 rounded-full transition-colors",
              (value.trim() || selectedImage) && !isComposerDisabled
                ? "bg-foreground text-background hover:bg-foreground/90"
                : "bg-muted text-muted-foreground"
            )}
          >
            <ArrowUp className="h-5 w-5" />
          </Button>
        </div>
      </form>

      {helperText ? (
        <p className="mt-2 px-2 text-center text-[11px] leading-4 text-muted-foreground sm:text-xs sm:leading-5">
          {helperText}
        </p>
      ) : null}
    </div>
  )
}
