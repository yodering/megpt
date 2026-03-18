"use client"

import {
  Plus,
  Search,
  Image,
  AppWindow,
  Sparkles,
  Heart,
  PanelLeftClose,
} from "lucide-react"
import { useSession, signIn } from "next-auth/react"

const navItems = [
  { icon: Plus, label: "New chat" },
  { icon: Search, label: "Search chats" },
  { icon: Image, label: "Images" },
  { icon: AppWindow, label: "Apps" },
  { icon: Sparkles, label: "Deep research" },
  { icon: Heart, label: "Health" },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { data: session } = useSession()

  if (collapsed) {
    return (
      <div className="flex flex-col items-center py-3 px-2 gap-3 border-r border-[#e5e5e5] bg-[#f9f9f9]">
        <button
          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-[#ececec] transition-colors"
        >
          <PanelLeftClose className="w-5 h-5 text-[#0d0d0d] rotate-180" />
        </button>
        <button className="p-2 rounded-lg hover:bg-[#ececec] transition-colors">
          <Plus className="w-5 h-5 text-[#0d0d0d]" />
        </button>
        <button className="p-2 rounded-lg hover:bg-[#ececec] transition-colors">
          <Search className="w-5 h-5 text-[#0d0d0d]" />
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col w-[260px] min-w-[260px] bg-[#f9f9f9] border-r border-[#e5e5e5] h-screen">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-3">
        <div className="flex items-center gap-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#0d0d0d" strokeWidth="1.5" />
            <circle cx="12" cy="12" r="4" fill="#0d0d0d" />
          </svg>
        </div>
        <button
          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-[#ececec] transition-colors"
        >
          <PanelLeftClose className="w-5 h-5 text-[#6e6e6e]" />
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex flex-col px-2 gap-0.5 mt-1">
        {navItems.map(({ icon: Icon, label }) => (
          <button
            key={label}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#0d0d0d] hover:bg-[#ececec] transition-colors text-left"
          >
            <Icon className="w-[18px] h-[18px] text-[#6e6e6e]" />
            {label}
          </button>
        ))}
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Bottom section */}
      <div className="px-3 pb-4">
        {!session && (
          <>
            <div className="bg-white rounded-xl p-3 mb-3 border border-[#e5e5e5]">
              <p className="text-sm text-[#0d0d0d] font-medium mb-1">
                Get responses tailored to you
              </p>
              <p className="text-xs text-[#6e6e6e] mb-2">
                Log in to get smarter responses
              </p>
              <button
                onClick={() => signIn("google")}
                className="w-full py-2 px-3 bg-[#0d0d0d] text-white text-sm rounded-full hover:bg-[#2d2d2d] transition-colors"
              >
                Log in
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
