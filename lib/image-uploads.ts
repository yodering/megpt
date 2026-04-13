import { randomUUID } from "crypto"
import { mkdir, unlink, writeFile } from "fs/promises"
import path from "path"

const uploadDirectory = path.join(process.cwd(), "public", "uploads")
const allowedMimeTypes = new Map<string, string>([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
  ["image/gif", ".gif"],
  ["image/avif", ".avif"],
])

const fallbackUploadLimit = 10 * 1024 * 1024
const configuredUploadLimit = Number(process.env.MAX_IMAGE_UPLOAD_BYTES ?? fallbackUploadLimit)

export const MAX_IMAGE_UPLOAD_BYTES =
  Number.isFinite(configuredUploadLimit) && configuredUploadLimit > 0
    ? configuredUploadLimit
    : fallbackUploadLimit

function getExtensionForMimeType(mimeType: string) {
  return allowedMimeTypes.get(mimeType) ?? null
}

export function getUploadedImageFilePath(imageUrl: string) {
  if (!imageUrl.startsWith("/uploads/")) {
    return null
  }

  return path.join(process.cwd(), "public", imageUrl.replace(/^\/+/, ""))
}

export async function deleteUploadedImageByUrl(imageUrl: string | null | undefined) {
  if (!imageUrl) return

  const filePath = getUploadedImageFilePath(imageUrl)
  if (!filePath) return

  await unlink(filePath).catch(() => undefined)
}

export async function saveUploadedImage(file: File) {
  if (!allowedMimeTypes.has(file.type)) {
    throw new Error("Only JPG, PNG, WEBP, GIF, and AVIF images are supported.")
  }

  if (file.size <= 0) {
    throw new Error("The selected image is empty.")
  }

  if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
    throw new Error("Images must be 10 MB or smaller.")
  }

  const extension = getExtensionForMimeType(file.type)
  if (!extension) {
    throw new Error("Unsupported image type.")
  }

  const fileName = `${randomUUID()}${extension}`
  const publicUrl = `/uploads/${fileName}`
  const filePath = path.join(uploadDirectory, fileName)
  const buffer = Buffer.from(await file.arrayBuffer())

  await mkdir(uploadDirectory, { recursive: true })
  await writeFile(filePath, buffer)

  return {
    filePath,
    publicUrl,
  }
}
