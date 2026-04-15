"use client"

import { useEffect, useRef, useState } from "react"
import {
  MoreHorizontal,
  PanelLeftClose,
  Pin,
  Search,
  PenBox,
  Trash2,
} from "lucide-react"
import { ProfileMenu } from "@/components/profile-menu"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SidebarProps {
  collapsed: boolean
  mobileOpen?: boolean
  onToggle: () => void
  onCloseMobile?: () => void
  conversations?: Array<{
    id: number
    title: string
    date: string
    pinned?: boolean
  }>
  activeConversationId?: number | null
  onSelectConversation?: (conversationId: number) => void
  onNewChat?: () => void
  onDeleteConversation?: (conversationId: number) => void
  onTogglePinConversation?: (conversationId: number) => void
}

export function Sidebar({
  collapsed,
  mobileOpen = false,
  onToggle,
  onCloseMobile,
  conversations = [],
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  onTogglePinConversation,
}: SidebarProps) {
  const [activeMenuConversationId, setActiveMenuConversationId] = useState<number | null>(
    null
  )
  const menuRootRef = useRef<HTMLDivElement>(null)

  const pinnedChats = conversations.filter((conversation) => conversation.pinned)
  const groupedChats = conversations
    .filter((conversation) => !conversation.pinned)
    .reduce<
    Record<string, Array<{ id: number; title: string; date: string; pinned?: boolean }>>
  >(
    (acc, conversation) => {
      if (!acc[conversation.date]) {
        acc[conversation.date] = []
      }
      acc[conversation.date].push(conversation)
      return acc
    },
    {}
  )

  useEffect(() => {
    if (activeMenuConversationId === null) return

    const handlePointerDown = (event: MouseEvent) => {
      if (!menuRootRef.current?.contains(event.target as Node)) {
        setActiveMenuConversationId(null)
      }
    }

    document.addEventListener("mousedown", handlePointerDown)
    return () => document.removeEventListener("mousedown", handlePointerDown)
  }, [activeMenuConversationId])

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-30 bg-black/40 transition-opacity duration-300 md:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onCloseMobile}
        aria-hidden={!mobileOpen}
      />
      <aside
        className={cn(
          "safe-top safe-bottom fixed inset-y-0 left-0 z-40 flex w-[min(82vw,320px)] flex-col overflow-hidden border-r border-sidebar-border bg-sidebar transition-transform duration-300 ease-in-out md:static md:z-auto md:w-auto md:border-r-0 md:transition-[width]",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          collapsed ? "md:w-0" : "md:w-[260px]"
        )}
        aria-hidden={collapsed && !mobileOpen}
      >
        {mobileOpen || !collapsed ? (
        <>
          <div className="flex items-center justify-between p-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className="h-10 w-10 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <PanelLeftClose className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent"
              >
                <Search className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onNewChat}
                className="h-10 w-10 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent"
              >
                <PenBox className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="momentum-scroll flex-1 overflow-y-auto px-2 py-2">
            {pinnedChats.length > 0 ? (
              <div className="mb-4">
                <h3 className="px-2 py-2 text-xs font-medium text-muted-foreground">
                  Pinned
                </h3>
                {pinnedChats.map((chat) => (
                  <ConversationRow
                    key={chat.id}
                    chat={chat}
                    activeConversationId={activeConversationId}
                    activeMenuConversationId={activeMenuConversationId}
                    onSelectConversation={onSelectConversation}
                    onToggleMenu={setActiveMenuConversationId}
                    onTogglePinConversation={onTogglePinConversation}
                    onDeleteConversation={onDeleteConversation}
                    menuRootRef={menuRootRef}
                  />
                ))}
              </div>
            ) : null}

            {Object.entries(groupedChats).map(([date, chats]) => (
              <div key={date} className="mb-4">
                <h3 className="px-2 py-2 text-xs font-medium text-muted-foreground">
                  {date}
                </h3>
                {chats?.map((chat) => (
                  <ConversationRow
                    key={chat.id}
                    chat={chat}
                    activeConversationId={activeConversationId}
                    activeMenuConversationId={activeMenuConversationId}
                    onSelectConversation={onSelectConversation}
                    onToggleMenu={setActiveMenuConversationId}
                    onTogglePinConversation={onTogglePinConversation}
                    onDeleteConversation={onDeleteConversation}
                    menuRootRef={menuRootRef}
                  />
                ))}
              </div>
            ))}
          </div>

          <div className="border-t border-sidebar-border p-2">
            <ProfileMenu variant="sidebar" />
          </div>
        </>
        ) : null}
      </aside>
    </>
  )
}

interface ConversationRowProps {
  chat: {
    id: number
    title: string
    date: string
    pinned?: boolean
  }
  activeConversationId?: number | null
  activeMenuConversationId: number | null
  onSelectConversation?: (conversationId: number) => void
  onToggleMenu: (conversationId: number | null) => void
  onTogglePinConversation?: (conversationId: number) => void
  onDeleteConversation?: (conversationId: number) => void
  menuRootRef: React.RefObject<HTMLDivElement | null>
}

function ConversationRow({
  chat,
  activeConversationId,
  activeMenuConversationId,
  onSelectConversation,
  onToggleMenu,
  onTogglePinConversation,
  onDeleteConversation,
  menuRootRef,
}: ConversationRowProps) {
  const isMenuOpen = activeMenuConversationId === chat.id

  return (
    <div
      className={cn(
        "group relative flex items-center gap-2 rounded-lg px-2 py-2 transition-colors",
        activeConversationId === chat.id
          ? "bg-sidebar-accent"
          : "hover:bg-sidebar-accent"
      )}
      onClick={() => onSelectConversation?.(chat.id)}
    >
      <span className="flex min-w-0 flex-1 items-center gap-2 truncate text-sm text-sidebar-foreground">
        {chat.pinned ? <Pin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" /> : null}
        <span className="truncate">{chat.title}</span>
      </span>

      <div ref={isMenuOpen ? menuRootRef : undefined} className="relative">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-md text-sidebar-foreground opacity-100 hover:bg-sidebar-border md:h-6 md:w-6 md:opacity-0 md:group-hover:opacity-100"
          onClick={(event) => {
            event.stopPropagation()
            onToggleMenu(isMenuOpen ? null : chat.id)
          }}
          title="Open chat actions"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>

        {isMenuOpen ? (
          <div className="absolute right-0 top-8 z-30 w-44 rounded-xl border border-border bg-popover p-1 shadow-[0_16px_40px_rgba(0,0,0,0.16)]">
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-foreground hover:bg-accent"
              onClick={(event) => {
                event.stopPropagation()
                onTogglePinConversation?.(chat.id)
                onToggleMenu(null)
              }}
            >
              <Pin className="h-4 w-4 text-muted-foreground" />
              {chat.pinned ? "Unpin chat" : "Pin chat"}
            </button>
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-foreground hover:bg-accent"
              onClick={(event) => {
                event.stopPropagation()
                onDeleteConversation?.(chat.id)
                onToggleMenu(null)
              }}
            >
              <Trash2 className="h-4 w-4 text-muted-foreground" />
              Delete chat
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
