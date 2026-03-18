"use client"

import { useSession, signIn, signOut } from "next-auth/react"
import { ChevronDown, CircleHelp } from "lucide-react"

export function ChatHeader() {
  const { data: session } = useSession()

  return (
    <header className="flex items-center justify-between px-4 py-2 border-b border-[#e5e5e5]/50 bg-white">
      {/* Left: model selector */}
      <button className="flex items-center gap-1 text-lg font-semibold text-[#0d0d0d] hover:bg-[#f5f5f5] rounded-lg px-2 py-1 transition-colors">
        ChatGPT
        <ChevronDown className="w-4 h-4 text-[#6e6e6e]" />
      </button>

      {/* Right: auth buttons */}
      <div className="flex items-center gap-2">
        {session ? (
          <>
            <button
              onClick={() => signOut()}
              className="text-sm text-[#6e6e6e] hover:text-[#0d0d0d] px-3 py-1.5 rounded-full transition-colors"
            >
              Sign out
            </button>
            <div className="w-8 h-8 rounded-full bg-[#0d0d0d] flex items-center justify-center text-white text-sm font-medium">
              {session.user?.name?.[0] || session.user?.email?.[0] || "?"}
            </div>
          </>
        ) : (
          <>
            <button
              onClick={() => signIn("google")}
              className="text-sm bg-[#0d0d0d] text-white px-4 py-2 rounded-full hover:bg-[#2d2d2d] transition-colors"
            >
              Log in
            </button>
            <button
              onClick={() => signIn("google")}
              className="text-sm border border-[#d1d1d1] text-[#0d0d0d] px-4 py-2 rounded-full hover:bg-[#f5f5f5] transition-colors"
            >
              Sign up
            </button>
          </>
        )}
        <button className="p-2 rounded-full hover:bg-[#f5f5f5] transition-colors">
          <CircleHelp className="w-5 h-5 text-[#6e6e6e]" />
        </button>
      </div>
    </header>
  )
}
