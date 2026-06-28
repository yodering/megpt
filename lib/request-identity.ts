import { createHmac, randomUUID, timingSafeEqual } from "crypto"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

const GUEST_ID_COOKIE = "megpt_guest_id"
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

  const guestId = getGuestIdFromRequest(request)

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

export async function getOrCreateRequestIdentity(request: Request): Promise<{
  identity: RequestIdentity
  setGuestCookie: boolean
}> {
  const identity = await getRequestIdentity(request)

  if (identity) {
    return { identity, setGuestCookie: false }
  }

  const guestId = randomUUID().replace(/-/g, "")

  return {
    identity: {
      isGuest: true,
      userEmail: `guest:${guestId}`,
      userName: "Guest",
      guestId,
    },
    setGuestCookie: true,
  }
}

export function setGuestIdentityCookie(response: Response, identity: RequestIdentity) {
  if (!identity.guestId) return response

  const secure = process.env.NODE_ENV === "production" ? "; Secure" : ""
  const cookieValue = encodeURIComponent(signGuestId(identity.guestId))
  response.headers.append(
    "Set-Cookie",
    `${GUEST_ID_COOKIE}=${cookieValue}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000${secure}`
  )

  return response
}

function getGuestIdFromRequest(request?: Request) {
  if (!request) return null

  const cookieHeader = request.headers.get("cookie")
  if (!cookieHeader) return null

  const cookies = cookieHeader.split(";")
  for (const cookie of cookies) {
    const [name, ...valueParts] = cookie.trim().split("=")
    if (name === GUEST_ID_COOKIE) {
      return verifySignedGuestId(decodeURIComponent(valueParts.join("=")).trim())
    }
  }

  return null
}

function signGuestId(guestId: string) {
  return `${guestId}.${getGuestIdSignature(guestId)}`
}

function verifySignedGuestId(value: string) {
  const [guestId, signature] = value.split(".")
  if (!guestId || !signature || !guestIdPattern.test(guestId)) {
    return null
  }

  const expected = getGuestIdSignature(guestId)
  const actualBuffer = Buffer.from(signature, "base64url")
  const expectedBuffer = Buffer.from(expected, "base64url")

  if (
    actualBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(actualBuffer, expectedBuffer)
  ) {
    return null
  }

  return guestId
}

function getGuestIdSignature(guestId: string) {
  return createHmac("sha256", getGuestCookieSecret())
    .update(guestId)
    .digest("base64url")
}

function getGuestCookieSecret() {
  const secret = process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET
  if (secret) return secret

  if (process.env.NODE_ENV === "production") {
    throw new Error("NEXTAUTH_SECRET or AUTH_SECRET is required for guest sessions.")
  }

  return "megpt-development-guest-cookie-secret"
}
