import type { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"

export function isAdminEmail(email?: string | null) {
  return Boolean(email && process.env.ADMIN_EMAIL && email === process.env.ADMIN_EMAIL)
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        const userId = token?.sub
        if (userId) {
          session.user.id = String(userId)
        }
        session.user.isAdmin = isAdminEmail(session.user.email)
      }
      return session
    },
  },
}
