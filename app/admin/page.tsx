import Link from "next/link"
import { redirect } from "next/navigation"
import { AdminInbox } from "@/components/admin-inbox"
import { getConversationForAdmin, listConversationsForAdmin } from "@/lib/conversations"
import { ensureDiscordBot } from "@/lib/discord-bot"
import { requireAdminSession } from "@/lib/server-auth"

async function loadAdminData() {
  try {
    const conversations = await listConversationsForAdmin()
    const initialConversation = conversations[0]
      ? await getConversationForAdmin(conversations[0].id)
      : null

    return { conversations, initialConversation, errorMessage: null }
  } catch (error) {
    return {
      conversations: [],
      initialConversation: null,
      errorMessage:
        error instanceof Error ? error.message : "Unknown database error",
    }
  }
}

export default async function AdminPage() {
  await ensureDiscordBot()
  const session = await requireAdminSession()

  if (!session) {
    redirect("/")
  }

  const { conversations, initialConversation, errorMessage } = await loadAdminData()

  if (!errorMessage) {
    return (
      <main className="min-h-screen bg-[#f3f1ec] text-[#161616]">
        <div className="border-b border-[#d8d1c4] bg-[#ebe4d6]">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[#6a6256]">
                Admin Inbox
              </p>
              <h1 className="text-2xl font-semibold">Operator dashboard</h1>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="rounded-full border border-[#c9bfaf] bg-white px-3 py-1.5">
                {session.user.email}
              </span>
              <Link
                href="/"
                className="rounded-full border border-[#c9bfaf] px-4 py-2 transition-colors hover:bg-white"
              >
                Back to app
              </Link>
            </div>
          </div>
        </div>

        <AdminInbox
          initialConversations={conversations}
          initialConversation={initialConversation}
        />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#f3f1ec] px-6 py-16 text-[#161616]">
      <div className="mx-auto max-w-3xl rounded-3xl border border-[#d8d1c4] bg-[#fffdf8] p-8">
        <p className="text-xs uppercase tracking-[0.24em] text-[#6a6256]">
          Admin Inbox
        </p>
        <h1 className="mt-3 text-3xl font-semibold">Database setup required</h1>
        <p className="mt-4 text-[#40382d]">
          The admin panel could not load because the database is not ready yet.
        </p>
        <pre className="mt-6 overflow-x-auto rounded-2xl bg-[#f7f3eb] p-4 text-sm text-[#40382d]">
          {errorMessage}
        </pre>
        <p className="mt-6 text-sm text-[#6a6256]">
          Redeploy this version so the app can auto-create its tables on first use.
        </p>
      </div>
    </main>
  )
}
