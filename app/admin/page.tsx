import Link from "next/link"
import { redirect } from "next/navigation"
import { AdminInbox } from "@/components/admin-inbox"
import { getConversationForAdmin, listConversationsForAdmin } from "@/lib/conversations"
import { requireAdminSession } from "@/lib/server-auth"

export default async function AdminPage() {
  const session = await requireAdminSession()

  if (!session) {
    redirect("/")
  }

  const conversations = await listConversationsForAdmin()
  const initialConversation = conversations[0]
    ? await getConversationForAdmin(conversations[0].id)
    : null

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
