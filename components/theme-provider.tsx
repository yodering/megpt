"use client"

import { createContext, useContext, useSyncExternalStore } from "react"

type Theme = "light" | "dark"

interface ThemeContextValue {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const STORAGE_KEY = "megpt-theme"

const ThemeContext = createContext<ThemeContextValue | null>(null)
const listeners = new Set<() => void>()

function applyTheme(theme: Theme) {
  const root = document.documentElement
  root.classList.remove("light", "dark")
  root.classList.add(theme)
  root.style.colorScheme = theme
}

function emitChange() {
  listeners.forEach((listener) => listener())
}

function getSnapshot(): Theme {
  if (typeof document === "undefined") {
    return "dark"
  }

  return document.documentElement.classList.contains("light") ? "light" : "dark"
}

function subscribe(listener: () => void) {
  listeners.add(listener)

  if (typeof window === "undefined") {
    return () => listeners.delete(listener)
  }

  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")

  const handleMediaChange = (event: MediaQueryListEvent) => {
    const storedTheme = window.localStorage.getItem(STORAGE_KEY)
    if (storedTheme === "light" || storedTheme === "dark") return

    applyTheme(event.matches ? "dark" : "light")
    emitChange()
  }

  const handleStorageChange = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return

    const nextTheme =
      event.newValue === "light" || event.newValue === "dark"
        ? event.newValue
        : mediaQuery.matches
          ? "dark"
          : "light"

    applyTheme(nextTheme)
    emitChange()
  }

  mediaQuery.addEventListener("change", handleMediaChange)
  window.addEventListener("storage", handleStorageChange)

  return () => {
    listeners.delete(listener)
    mediaQuery.removeEventListener("change", handleMediaChange)
    window.removeEventListener("storage", handleStorageChange)
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(
    subscribe,
    getSnapshot,
    (): Theme => "dark"
  )

  const setTheme = (nextTheme: Theme) => {
    window.localStorage.setItem(STORAGE_KEY, nextTheme)
    applyTheme(nextTheme)
    emitChange()
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme: () => setTheme(getSnapshot() === "dark" ? "light" : "dark"),
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider")
  }

  return context
}
