"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { signIn, signOut, useSession } from "next-auth/react"
import {
  ChevronLeft,
  ChevronUp,
  FileText,
  LogIn,
  LogOut,
  Moon,
  Settings2,
  Shield,
  Sun,
} from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ProfileMenuProps {
  variant?: "header" | "sidebar"
}

export function ProfileMenu({ variant = "header" }: ProfileMenuProps) {
  const { data: session } = useSession()
  const { theme, setTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const [activeView, setActiveView] = useState<"menu" | "settings">("menu")
  const rootRef = useRef<HTMLDivElement>(null)
  const userLabel = session?.user?.name || session?.user?.email || "Guest"
  const userInitial = userLabel[0]?.toUpperCase() || "G"

  const openMenu = () => {
    setActiveView("menu")
    setIsOpen(true)
  }

  const closeMenu = () => {
    setActiveView("menu")
    setIsOpen(false)
  }

  useEffect(() => {
    if (!isOpen) return

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        closeMenu()
      }
    }

    document.addEventListener("mousedown", handlePointerDown)
    return () => document.removeEventListener("mousedown", handlePointerDown)
  }, [isOpen])

  return (
    <div
      ref={rootRef}
      className={cn("relative", variant === "sidebar" ? "w-full" : "")}
    >
      {variant === "header" ? (
        <button
          type="button"
          onClick={() => {
            if (isOpen) {
              closeMenu()
              return
            }

            openMenu()
          }}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 text-xs font-medium text-white"
          title="Open profile menu"
        >
          {userInitial}
        </button>
      ) : (
        <Button
          variant="ghost"
          onClick={() => {
            if (isOpen) {
              closeMenu()
              return
            }

            openMenu()
          }}
          className="w-full justify-between rounded-lg text-sidebar-foreground hover:bg-sidebar-accent"
        >
          <span className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 text-xs font-medium text-white">
              {userInitial}
            </span>
            <span className="truncate text-sm">{userLabel}</span>
          </span>
          <ChevronUp
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform",
              isOpen ? "rotate-180" : ""
            )}
          />
        </Button>
      )}

      {isOpen ? (
        <div
          className={cn(
            "absolute z-30 w-72 rounded-2xl border border-border bg-popover p-2 shadow-[0_20px_50px_rgba(0,0,0,0.18)]",
            variant === "header" ? "right-0 top-10" : "bottom-12 left-0"
          )}
        >
          {activeView === "menu" ? (
            <>
              <div className="rounded-xl px-3 py-3">
                <p className="text-sm font-medium text-foreground">{userLabel}</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {session
                    ? "Signed in account"
                    : "Guest mode is active. Sign in if you want persistent chat history."}
                </p>
              </div>

              <div className="my-2 h-px bg-border" />

              <div className="space-y-1">
                <button
                  type="button"
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-foreground hover:bg-accent"
                  onClick={() => setActiveView("settings")}
                >
                  <Settings2 className="h-4 w-4 text-muted-foreground" />
                  Settings
                </button>
                <Link
                  href="/privacy"
                  className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-foreground hover:bg-accent"
                  onClick={closeMenu}
                >
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  Privacy Policy
                </Link>
                <Link
                  href="/terms"
                  className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-foreground hover:bg-accent"
                  onClick={closeMenu}
                >
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  Terms of Service
                </Link>
                {session ? (
                  <button
                    type="button"
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-foreground hover:bg-accent"
                    onClick={() => {
                      closeMenu()
                      void signOut()
                    }}
                  >
                    <LogOut className="h-4 w-4 text-muted-foreground" />
                    Sign out
                  </button>
                ) : (
                  <button
                    type="button"
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-foreground hover:bg-accent"
                    onClick={() => {
                      closeMenu()
                      void signIn("google")
                    }}
                  >
                    <LogIn className="h-4 w-4 text-muted-foreground" />
                    Sign in with Google
                  </button>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 px-1 py-1">
                <button
                  type="button"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
                  onClick={() => setActiveView("menu")}
                  title="Back to menu"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <div>
                  <p className="text-sm font-medium text-foreground">Settings</p>
                  <p className="text-xs text-muted-foreground">Manage your app preferences</p>
                </div>
              </div>

              <div className="my-2 h-px bg-border" />

              <div className="rounded-xl px-3 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Appearance
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Choose how MeGPT looks across the app.
                </p>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    className={cn(
                      "flex items-center gap-2 rounded-xl border px-3 py-3 text-sm transition-colors",
                      theme === "dark"
                        ? "border-foreground bg-accent text-foreground"
                        : "border-border text-muted-foreground hover:bg-accent"
                    )}
                    onClick={() => setTheme("dark")}
                  >
                    <Moon className="h-4 w-4" />
                    Dark
                  </button>
                  <button
                    type="button"
                    className={cn(
                      "flex items-center gap-2 rounded-xl border px-3 py-3 text-sm transition-colors",
                      theme === "light"
                        ? "border-foreground bg-accent text-foreground"
                        : "border-border text-muted-foreground hover:bg-accent"
                    )}
                    onClick={() => setTheme("light")}
                  >
                    <Sun className="h-4 w-4" />
                    Light
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      ) : null}
    </div>
  )
}
