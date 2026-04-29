"use client"

import { createContext, useContext, useSyncExternalStore } from "react"

type Theme = "light" | "dark" | "system"
type ResolvedTheme = "light" | "dark"

interface ThemeContextValue {
  theme: Theme
  resolvedTheme: ResolvedTheme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const STORAGE_KEY = "megpt-theme"
const FAVICON_PATH =
  "M14 44V23.5h6.2v3.1c1.4-2.3 3.8-3.6 6.8-3.6 3.3 0 5.8 1.5 7.1 4.2 1.6-2.7 4.4-4.2 7.7-4.2 5.4 0 8.9 3.8 8.9 10.1V44h-6.5v-9.7c0-3.5-1.5-5.3-4.3-5.3-2.9 0-4.6 2.1-4.6 5.7V44h-6.5v-9.7c0-3.5-1.5-5.3-4.2-5.3-2.9 0-4.7 2.1-4.7 5.7V44H14Z"

const ThemeContext = createContext<ThemeContextValue | null>(null)
const listeners = new Set<() => void>()

function getStoredThemePreference(): Theme {
  if (typeof window === "undefined") {
    return "system"
  }

  const storedTheme = window.localStorage.getItem(STORAGE_KEY)
  return storedTheme === "light" || storedTheme === "dark" || storedTheme === "system"
    ? storedTheme
    : "system"
}

function resolveTheme(theme: Theme): ResolvedTheme {
  if (theme === "light" || theme === "dark") {
    return theme
  }

  if (typeof window === "undefined") {
    return "dark"
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

function applyTheme(theme: Theme) {
  const root = document.documentElement
  const resolvedTheme = resolveTheme(theme)
  root.classList.remove("light", "dark")
  root.classList.add(resolvedTheme)
  root.style.colorScheme = resolvedTheme
  updateFavicon(resolvedTheme)
}

function updateFavicon(resolvedTheme: ResolvedTheme) {
  const background = resolvedTheme === "dark" ? "#ffffff" : "#0d0d0d"
  const foreground = resolvedTheme === "dark" ? "#0d0d0d" : "#ffffff"
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="${background}"/><path d="${FAVICON_PATH}" fill="${foreground}"/></svg>`
  const href = `data:image/svg+xml,${encodeURIComponent(svg)}`
  const iconLink =
    document.querySelector<HTMLLinkElement>('link[rel="icon"]') ??
    document.createElement("link")

  iconLink.rel = "icon"
  iconLink.type = "image/svg+xml"
  iconLink.href = href

  if (!iconLink.parentNode) {
    document.head.appendChild(iconLink)
  }
}

function emitChange() {
  listeners.forEach((listener) => listener())
}

function getSnapshot(): Theme {
  return getStoredThemePreference()
}

function getResolvedSnapshot(): ResolvedTheme {
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
    const storedTheme = getStoredThemePreference()
    if (storedTheme !== "system") return

    applyTheme(event.matches ? "dark" : "light")
    emitChange()
  }

  const handleStorageChange = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return

    const nextTheme =
      event.newValue === "light" || event.newValue === "dark" || event.newValue === "system"
        ? event.newValue
        : "system"
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
    (): Theme => "system"
  )
  const resolvedTheme = useSyncExternalStore(
    subscribe,
    getResolvedSnapshot,
    (): ResolvedTheme => "dark"
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
        resolvedTheme,
        setTheme,
        toggleTheme: () => setTheme(getResolvedSnapshot() === "dark" ? "light" : "dark"),
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
