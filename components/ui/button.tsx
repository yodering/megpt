"use client"

import type { ButtonHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

type ButtonVariant = "default" | "ghost" | "outline"
type ButtonSize = "default" | "sm" | "icon"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
}

const variantClasses: Record<ButtonVariant, string> = {
  default: "bg-foreground text-background hover:bg-foreground/90",
  ghost: "bg-transparent hover:bg-accent text-foreground",
  outline: "border border-border bg-transparent hover:bg-accent text-foreground",
}

const sizeClasses: Record<ButtonSize, string> = {
  default: "h-9 px-4 py-2 rounded-md",
  sm: "h-8 px-3 rounded-md text-sm",
  icon: "h-9 w-9 rounded-md",
}

export function Button({
  className,
  variant = "default",
  size = "default",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    />
  )
}
