import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

const GUEST_ID_HEADER = "x-guest-id"
const guestIdPattern = /^[a-zA-Z0-9_-]{8,128}$/

export type RequestIdentity = {
  isGuest: boolean
  userEmail: string
  userName: string | null
  guestId: string | null
}

export async function getRequestIdentity(request?: Request): Promise<RequestIdentity | null> {
  const session = await getServerSession(authOptions)

  if (session?.user?.email) {
    return {
      isGuest: false,
      userEmail: session.user.email,
      userName: session.user.name ?? null,
      guestId: null,
    }
  }

  const guestId = request?.headers.get(GUEST_ID_HEADER)?.trim() ?? null

  if (!guestId || !guestIdPattern.test(guestId)) {
    return null
  }

  return {
    isGuest: true,
    userEmail: `guest:${guestId}`,
    userName: "Guest",
    guestId,
  }
}

export function getGuestIdHeader() {
  return GUEST_ID_HEADER
}
