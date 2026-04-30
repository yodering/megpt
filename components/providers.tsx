"use client"

import { SessionProvider } from "next-auth/react"
import { ThemeProvider } from "@/components/theme-provider"
import { NEXT_AUTH_BASE_PATH } from "@/lib/paths"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider basePath={NEXT_AUTH_BASE_PATH}>
      <ThemeProvider>{children}</ThemeProvider>
    </SessionProvider>
  )
}
