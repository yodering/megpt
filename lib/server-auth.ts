import { getServerSession } from "next-auth"
import { authOptions, isAdminEmail } from "@/lib/auth"

export async function requireSession() {
  const session = await getServerSession(authOptions)
  return session
}

export async function requireAdminSession() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email || !isAdminEmail(session.user.email)) {
    return null
  }

  return session
}
