"use client"

import { useState, useRef, useEffect } from "react"
import { PanelLeft, ChevronDown, Share, PenBox } from "lucide-react"
import { ChatSidebar } from "@/components/chat-sidebar"
import { ChatMessage } from "@/components/chat-message"
import { ChatInput } from "@/components/chat-input"
import { WelcomeScreen } from "@/components/welcome-screen"
import { Button } from "@/components/ui/button"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

interface Chat {
  id: string
  title: string
  date: string
  messages: Message[]
}

const initialChatHistory: Chat[] = [
  {
    id: "1",
    title: "React component patterns",
    date: "Today",
    messages: [
      { id: "1", role: "user", content: "What are the best React component patterns?" },
      { id: "2", role: "assistant", content: "Here are some of the most effective React component patterns:\n\n1. **Compound Components** - Create components that work together implicitly sharing state\n\n2. **Render Props** - Share code between components using a prop whose value is a function\n\n3. **Higher-Order Components (HOCs)** - A function that takes a component and returns a new enhanced component\n\n4. **Custom Hooks** - Extract component logic into reusable functions\n\n5. **Container/Presentational** - Separate data-fetching logic from UI rendering\n\nWould you like me to elaborate on any of these patterns?" }
    ]
  },
  {
    id: "2",
    title: "Python data analysis",
    date: "Today",
    messages: []
  },
  {
    id: "3",
    title: "Machine learning basics",
    date: "Yesterday",
    messages: []
  },
  {
    id: "4",
    title: "CSS Grid vs Flexbox",
    date: "Yesterday",
    messages: []
  },
  {
    id: "5",
    title: "API design principles",
    date: "Previous 7 Days",
    messages: []
  },
  {
    id: "6",
    title: "Database optimization tips",
    date: "Previous 7 Days",
    messages: []
  }
]

export default function ChatPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [chats, setChats] = useState<Chat[]>(initialChatHistory)
  const [activeChatId, setActiveChatId] = useState<string | null>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const activeChat = chats.find((chat) => chat.id === activeChatId)
  const messages = activeChat?.messages || []

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: "New chat",
      date: "Today",
      messages: []
    }
    setChats([newChat, ...chats])
    setActiveChatId(newChat.id)
  }

  const handleSelectChat = (id: string) => {
    setActiveChatId(id)
  }

  const simulateResponse = (userMessage: string): string => {
    const responses = [
      "That's a great question! Let me think about this...\n\nBased on my understanding, there are several key points to consider here. First, it's important to understand the context and requirements. Then, we can explore different approaches and their trade-offs.\n\nWould you like me to dive deeper into any specific aspect?",
      "I'd be happy to help with that!\n\nHere's what I can tell you:\n\n1. **Key Point One** - This is fundamental to understanding the topic\n2. **Key Point Two** - Building on the first point\n3. **Key Point Three** - Practical applications\n\nLet me know if you need more details!",
      "Interesting topic! Here's my take on it:\n\nThe main considerations are efficiency, maintainability, and scalability. Each of these factors plays a crucial role in determining the best approach.\n\nDo you have any specific constraints or requirements I should consider?",
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  const handleSendMessage = async (content: string) => {
    let currentChatId = activeChatId

    if (!currentChatId) {
      const newChat: Chat = {
        id: Date.now().toString(),
        title: content.slice(0, 30) + (content.length > 30 ? "..." : ""),
        date: "Today",
        messages: []
      }
      setChats([newChat, ...chats])
      currentChatId = newChat.id
      setActiveChatId(newChat.id)
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content
    }

    setChats((prev) =>
      prev.map((chat) =>
        chat.id === currentChatId
          ? { 
              ...chat, 
              messages: [...chat.messages, userMessage],
              title: chat.messages.length === 0 ? content.slice(0, 30) + (content.length > 30 ? "..." : "") : chat.title
            }
          : chat
      )
    )

    setIsStreaming(true)

    // Simulate streaming delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: simulateResponse(content)
    }

    setChats((prev) =>
      prev.map((chat) =>
        chat.id === currentChatId
          ? { ...chat, messages: [...chat.messages, assistantMessage] }
          : chat
      )
    )

    setIsStreaming(false)
  }

  return (
    <div className="flex h-screen bg-background">
      <ChatSidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        chatHistory={chats}
        activeChatId={activeChatId}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
      />

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between h-14 px-4 border-b border-transparent">
          <div className="flex items-center gap-2">
            {!sidebarOpen && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(true)}
                  className="h-10 w-10 rounded-lg text-foreground hover:bg-accent"
                >
                  <PanelLeft className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleNewChat}
                  className="h-10 w-10 rounded-lg text-foreground hover:bg-accent"
                >
                  <PenBox className="h-5 w-5" />
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              className="h-10 rounded-lg px-3 text-foreground hover:bg-accent gap-1"
            >
              <span className="font-medium">ChatGPT</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            {activeChat && messages.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="h-9 rounded-full px-4 gap-2 border-border bg-transparent text-foreground hover:bg-accent"
              >
                <Share className="h-4 w-4" />
                <span>Share</span>
              </Button>
            )}
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 text-xs font-medium text-white cursor-pointer">
              U
            </div>
          </div>
        </header>

        {/* Chat area */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <WelcomeScreen />
            </div>
          ) : (
            <div className="max-w-3xl mx-auto px-4 py-4">
              {messages.map((message, index) => (
                <ChatMessage
                  key={message.id}
                  role={message.role}
                  content={message.content}
                  isStreaming={isStreaming && index === messages.length - 1 && message.role === "assistant"}
                />
              ))}
              {isStreaming && messages[messages.length - 1]?.role === "user" && (
                <ChatMessage role="assistant" content="" isStreaming />
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="pb-4">
          <ChatInput onSend={handleSendMessage} disabled={isStreaming} />
        </div>
      </main>
    </div>
  )
}
