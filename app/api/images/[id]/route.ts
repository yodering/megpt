import { NextRequest } from "next/server"
import { readUploadedImageByUrlForUser } from "@/lib/image-uploads"
import { getRequestIdentity } from "@/lib/request-identity"

export const runtime = "nodejs"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const identity = await getRequestIdentity(req)
  if (!identity) {
    return new Response("Not found", { status: 404 })
  }

  const { id } = await params
  const image = await readUploadedImageByUrlForUser(
    `/api/images/${id}`,
    identity.userEmail
  ).catch(() => null)

  if (!image) {
    return new Response("Not found", { status: 404 })
  }

  const body = new Uint8Array(image.buffer)

  return new Response(body, {
    headers: {
      "Content-Type": image.mimeType,
      "Cache-Control": "private, max-age=31536000, immutable",
      "Content-Length": String(body.byteLength),
    },
  })
}
