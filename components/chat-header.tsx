"use client"

import { ChevronDown, PanelLeft, PenBox, Share } from "lucide-react"
import { ProfileMenu } from "@/components/profile-menu"
import { Button } from "@/components/ui/button"

interface ChatHeaderProps {
  sidebarCollapsed: boolean
  onToggleSidebar: () => void
  onNewChat: () => void
  hasMessages?: boolean
}

export function ChatHeader({
  sidebarCollapsed,
  onToggleSidebar,
  onNewChat,
  hasMessages = false,
}: ChatHeaderProps) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-transparent px-4">
      <div className="flex items-center gap-2">
        {sidebarCollapsed ? (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleSidebar}
              className="h-10 w-10 rounded-lg text-foreground hover:bg-accent"
            >
              <PanelLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onNewChat}
              className="h-10 w-10 rounded-lg text-foreground hover:bg-accent"
            >
              <PenBox className="h-5 w-5" />
            </Button>
          </>
        ) : null}

        <Button
          variant="ghost"
          className="h-10 rounded-lg px-3 text-foreground hover:bg-accent"
        >
          <span className="font-medium">MeGPT</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-2">
        {hasMessages ? (
          <Button
            variant="outline"
            size="sm"
            className="hidden h-9 rounded-full border-border bg-transparent px-4 text-foreground hover:bg-accent sm:inline-flex"
          >
            <Share className="h-4 w-4" />
            <span>Share</span>
          </Button>
        ) : null}

        <ProfileMenu variant="header" />
      </div>
    </header>
  )
}
