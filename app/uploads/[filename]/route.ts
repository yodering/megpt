import { NextRequest } from "next/server"
import { readUploadedImageByUrl } from "@/lib/image-uploads"

export const runtime = "nodejs"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params
  const image = await readUploadedImageByUrl(`/uploads/${filename}`)

  if (!image) {
    return new Response("Not found", { status: 404 })
  }

  return new Response(image.buffer, {
    headers: {
      "Content-Type": image.mimeType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  })
}
