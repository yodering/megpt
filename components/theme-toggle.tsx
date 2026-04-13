"use client"

import { Moon, Sun } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTheme } from "@/components/theme-provider"

interface ThemeToggleProps {
  className?: string
  showLabel?: boolean
}

export function ThemeToggle({
  className,
  showLabel = false,
}: ThemeToggleProps) {
  const { toggleTheme } = useTheme()

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-sm text-foreground hover:bg-accent",
        className
      )}
      aria-label="Toggle color theme"
      title="Toggle color theme"
    >
      <Sun className="theme-toggle-sun h-4 w-4" />
      <Moon className="theme-toggle-moon h-4 w-4" />
      {showLabel ? <span>Theme</span> : null}
    </button>
  )
}
