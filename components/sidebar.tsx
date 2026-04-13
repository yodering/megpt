"use client"

import {
  MoreHorizontal,
  PanelLeftClose,
  Search,
  PenBox,
} from "lucide-react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  conversations?: Array<{
    id: number
    title: string
    date: string
  }>
  activeConversationId?: number | null
  onSelectConversation?: (conversationId: number) => void
  onNewChat?: () => void
  onDeleteConversation?: (conversationId: number) => void
}

export function Sidebar({
  collapsed,
  onToggle,
  conversations = [],
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
}: SidebarProps) {
  const { data: session } = useSession()
  const userLabel = session?.user?.name || "Guest"
  const groupedChats = conversations.reduce<
    Record<string, Array<{ id: number; title: string; date: string }>>
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

  return (
    <aside
      className={cn(
        "flex h-screen flex-col overflow-hidden bg-sidebar transition-all duration-300 ease-in-out",
        collapsed ? "w-0" : "w-[260px]"
      )}
      aria-hidden={collapsed}
    >
      {!collapsed ? (
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

          <div className="flex-1 overflow-y-auto px-2 py-2">
            {Object.entries(groupedChats).map(([date, chats]) => (
              <div key={date} className="mb-4">
                <h3 className="px-2 py-2 text-xs font-medium text-muted-foreground">
                  {date}
                </h3>
                {chats?.map((chat) => (
                  <div
                    key={chat.id}
                    className={cn(
                      "group relative flex items-center gap-2 rounded-lg px-2 py-2 transition-colors",
                      activeConversationId === chat.id
                        ? "bg-sidebar-accent"
                        : "hover:bg-sidebar-accent"
                    )}
                    onClick={() => onSelectConversation?.(chat.id)}
                  >
                    <span className="flex-1 truncate text-sm text-sidebar-foreground">
                      {chat.title}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 rounded-md text-sidebar-foreground opacity-0 group-hover:opacity-100 hover:bg-sidebar-border"
                      onClick={(event) => {
                        event.stopPropagation()
                        onDeleteConversation?.(chat.id)
                      }}
                      title="Delete chat"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className="border-t border-sidebar-border p-2">
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 text-xs font-medium text-white">
                {userLabel[0]?.toUpperCase() || "U"}
              </div>
              <span className="truncate text-sm">{userLabel}</span>
            </Button>
          </div>
        </>
      ) : null}
    </aside>
  )
}
