import type { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import PostgresAdapter from "@auth/pg-adapter"
import { getDbPool } from "@/lib/db"

const pool = process.env.DATABASE_URL ? getDbPool() : null

export function isAdminEmail(email?: string | null) {
  return Boolean(email && process.env.ADMIN_EMAIL && email === process.env.ADMIN_EMAIL)
}

export const authOptions: NextAuthOptions = {
  adapter: pool ? PostgresAdapter(pool) : undefined,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: pool ? "database" : "jwt",
  },
  callbacks: {
    async session({ session, token, user }) {
      if (session.user) {
        const userId = user?.id ?? token?.sub
        if (userId) {
          session.user.id = String(userId)
        }
        session.user.isAdmin = isAdminEmail(session.user.email)
      }
      return session
    },
  },
}
