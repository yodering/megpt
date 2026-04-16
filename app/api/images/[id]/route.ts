import { NextRequest } from "next/server"
import { readUploadedImageByUrl } from "@/lib/image-uploads"

export const runtime = "nodejs"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const image = await readUploadedImageByUrl(`/api/images/${id}`)

  if (!image) {
    return new Response("Not found", { status: 404 })
  }

  const body = new Uint8Array(image.buffer)

  return new Response(body, {
    headers: {
      "Content-Type": image.mimeType,
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Length": String(body.byteLength),
    },
  })
}
