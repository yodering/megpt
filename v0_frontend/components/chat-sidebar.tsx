"use client"

import { useState } from "react"
import { Plus, MessageSquare, MoreHorizontal, PanelLeftClose, Search, PenBox } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface ChatHistory {
  id: string
  title: string
  date: string
}

interface ChatSidebarProps {
  isOpen: boolean
  onToggle: () => void
  chatHistory: ChatHistory[]
  activeChatId: string | null
  onSelectChat: (id: string) => void
  onNewChat: () => void
}

export function ChatSidebar({
  isOpen,
  onToggle,
  chatHistory,
  activeChatId,
  onSelectChat,
  onNewChat,
}: ChatSidebarProps) {
  const [hoveredChat, setHoveredChat] = useState<string | null>(null)

  const groupedChats = chatHistory.reduce((acc, chat) => {
    if (!acc[chat.date]) {
      acc[chat.date] = []
    }
    acc[chat.date].push(chat)
    return acc
  }, {} as Record<string, ChatHistory[]>)

  return (
    <aside
      className={cn(
        "flex flex-col bg-sidebar h-screen transition-all duration-300 ease-in-out",
        isOpen ? "w-[260px]" : "w-0"
      )}
    >
      {isOpen && (
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
                {chats.map((chat) => (
                  <div
                    key={chat.id}
                    className={cn(
                      "group relative flex items-center gap-2 rounded-lg px-2 py-2 cursor-pointer transition-colors",
                      activeChatId === chat.id
                        ? "bg-sidebar-accent"
                        : "hover:bg-sidebar-accent"
                    )}
                    onClick={() => onSelectChat(chat.id)}
                    onMouseEnter={() => setHoveredChat(chat.id)}
                    onMouseLeave={() => setHoveredChat(null)}
                  >
                    <span className="flex-1 truncate text-sm text-sidebar-foreground">
                      {chat.title}
                    </span>
                    {hoveredChat === chat.id && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 rounded-md opacity-0 group-hover:opacity-100 text-sidebar-foreground hover:bg-sidebar-border"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className="p-2 border-t border-sidebar-border">
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 text-xs font-medium text-white">
                U
              </div>
              <span className="text-sm">User</span>
            </Button>
          </div>
        </>
      )}
    </aside>
  )
}
