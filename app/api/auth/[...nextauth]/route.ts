import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import PostgresAdapter from "@auth/pg-adapter"
import { getDbPool } from "@/lib/db"

export const runtime = "nodejs"

const pool = process.env.DATABASE_URL ? getDbPool() : null

const handler = NextAuth({
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
      }
      return session
    },
  },
})

export { handler as GET, handler as POST }
