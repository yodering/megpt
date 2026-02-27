"use client"

import { useSession, signIn, signOut } from "next-auth/react"
import { useEffect, useState } from "react"

export default function Home() {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<{role: string, content: string}[]>([])
  const conversationId = "test-123"

  useEffect(() => {
    if (!session) return
    const es = new EventSource(`/api/sse?conversationId=${conversationId}`)
    es.onmessage = (e) => {
      const data = JSON.parse(e.data)
      setMessages(prev => [...prev, { role: "assistant", content: data.message }])
    }
    return () => es.close()
  }, [session])

  async function testTelegram() {
    const text = "Hello from the web app!"
    setMessages(prev => [...prev, { role: "user", content: text }])
    await fetch("/api/telegram", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        userEmail: session?.user?.email,
        conversationId,
      }),
    })
  }

  if (session) {
    return (
      <div>
        <p>Signed in as {session.user?.email}</p>
        <button onClick={() => signOut()}>Sign out</button>
        <div>
          {messages.map((m, i) => (
            <p key={i}><strong>{m.role}:</strong> {m.content}</p>
          ))}
        </div>
        <button onClick={testTelegram}>Send Message</button>
      </div>
    )
  }

  return (
    <button onClick={() => signIn("google")}>Sign in with Google</button>
  )
}
