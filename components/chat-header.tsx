"use client"

import { ChevronDown, PanelLeft, PenBox, Share } from "lucide-react"
import { ProfileMenu } from "@/components/profile-menu"
import { Button } from "@/components/ui/button"

interface ChatHeaderProps {
  sidebarCollapsed: boolean
  isMobileViewport?: boolean
  onToggleSidebar: () => void
  onNewChat: () => void
  hasMessages?: boolean
}

export function ChatHeader({
  sidebarCollapsed,
  isMobileViewport = false,
  onToggleSidebar,
  onNewChat,
  hasMessages = false,
}: ChatHeaderProps) {
  const showSidebarControls = isMobileViewport || sidebarCollapsed

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between border-b border-border/60 bg-background/82 px-3 backdrop-blur-xl sm:px-4">
      <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
        {showSidebarControls ? (
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
          className="h-10 min-w-0 rounded-lg px-2.5 text-foreground hover:bg-accent sm:px-3"
        >
          <span className="truncate font-medium">MeGPT</span>
          <ChevronDown className="h-4 w-4 shrink-0" />
        </Button>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {hasMessages ? (
          <Button
            variant="outline"
            size="sm"
            className="hidden h-9 rounded-full border-border bg-transparent px-4 text-foreground hover:bg-accent md:inline-flex"
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
