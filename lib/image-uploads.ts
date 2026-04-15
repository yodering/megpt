import { randomUUID } from "crypto"
import { mkdir, readFile, unlink, writeFile } from "fs/promises"
import path from "path"
import sharp from "sharp"

const uploadDirectory = path.join(process.cwd(), "public", "uploads")
const allowedMimeTypes = new Map<string, string>([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
  ["image/gif", ".gif"],
  ["image/avif", ".avif"],
])
const allowedExtensions = new Map<string, string>(
  [...allowedMimeTypes.entries()].map(([mimeType, extension]) => [extension, mimeType])
)

const fallbackUploadLimit = 10 * 1024 * 1024
const configuredUploadLimit = Number(process.env.MAX_IMAGE_UPLOAD_BYTES ?? fallbackUploadLimit)

export const MAX_IMAGE_UPLOAD_BYTES =
  Number.isFinite(configuredUploadLimit) && configuredUploadLimit > 0
    ? configuredUploadLimit
    : fallbackUploadLimit

function getExtensionForMimeType(mimeType: string) {
  return allowedMimeTypes.get(mimeType) ?? null
}

function normalizeMimeType(mimeType: string | null | undefined) {
  if (!mimeType) return null

  const normalized = mimeType.split(";")[0]?.trim().toLowerCase() ?? ""
  if (!normalized) return null

  if (normalized === "image/jpg") {
    return "image/jpeg"
  }

  return normalized
}

function getMimeTypeForFileName(fileName: string | null | undefined) {
  if (!fileName) return null

  const extension = path.extname(fileName).toLowerCase()
  return allowedExtensions.get(extension) ?? null
}

function getMimeTypeForUrl(imageUrl: string) {
  try {
    const url = new URL(imageUrl)
    return getMimeTypeForFileName(url.pathname)
  } catch {
    return getMimeTypeForFileName(imageUrl)
  }
}

export function resolveSupportedImageMimeType(options: {
  mimeType?: string | null
  fileName?: string | null
  imageUrl?: string | null
}) {
  const normalizedMimeType = normalizeMimeType(options.mimeType)
  if (normalizedMimeType && allowedMimeTypes.has(normalizedMimeType)) {
    return normalizedMimeType
  }

  return (
    getMimeTypeForFileName(options.fileName) ??
    (options.imageUrl ? getMimeTypeForUrl(options.imageUrl) : null)
  )
}

async function writeImageBuffer(buffer: Buffer, mimeType: string) {
  const extension = getExtensionForMimeType(mimeType)
  if (!extension) {
    throw new Error("Unsupported image type.")
  }

  const fileName = `${randomUUID()}${extension}`
  const publicUrl = `/uploads/${fileName}`
  const filePath = path.join(uploadDirectory, fileName)

  await mkdir(uploadDirectory, { recursive: true })
  await writeFile(filePath, buffer)

  return {
    filePath,
    publicUrl,
  }
}

async function normalizeRemoteImageBufferForBrowserCompatibility(buffer: Buffer) {
  const metadata = await sharp(buffer, { animated: true }).metadata()
  const format = metadata.format?.toLowerCase() ?? null

  if (!format) {
    throw new Error("Unsupported image type.")
  }

  if (format === "jpeg" || format === "jpg") {
    return { buffer, mimeType: "image/jpeg" }
  }

  if (format === "png") {
    return { buffer, mimeType: "image/png" }
  }

  if (format === "gif") {
    return { buffer, mimeType: "image/gif" }
  }

  // Normalize newer or inconsistent formats so Safari/mobile rendering is predictable.
  const normalizedBuffer = await sharp(buffer, { animated: true }).png().toBuffer()
  return { buffer: normalizedBuffer, mimeType: "image/png" }
}

export function getUploadedImageFilePath(imageUrl: string) {
  const match = imageUrl.match(/^\/(?:api\/)?uploads\/([^/?#]+)$/)
  if (!match) {
    return null
  }

  return path.join(uploadDirectory, match[1])
}

export function getMimeTypeForStoredImagePath(filePath: string) {
  return getMimeTypeForFileName(filePath)
}

export async function readUploadedImageByUrl(imageUrl: string) {
  const filePath = getUploadedImageFilePath(imageUrl)
  if (!filePath) {
    return null
  }

  const mimeType = getMimeTypeForStoredImagePath(filePath)
  if (!mimeType) {
    return null
  }

  const buffer = await readFile(filePath).catch(() => null)
  if (!buffer) {
    return null
  }

  return {
    buffer,
    mimeType,
    filePath,
  }
}

export async function deleteUploadedImageByUrl(imageUrl: string | null | undefined) {
  if (!imageUrl) return

  const filePath = getUploadedImageFilePath(imageUrl)
  if (!filePath) return

  await unlink(filePath).catch(() => undefined)
}

export async function saveUploadedImage(file: File) {
  const mimeType = resolveSupportedImageMimeType({ mimeType: file.type, fileName: file.name })
  if (!mimeType) {
    throw new Error("Only JPG, PNG, WEBP, GIF, and AVIF images are supported.")
  }

  if (file.size <= 0) {
    throw new Error("The selected image is empty.")
  }

  if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
    throw new Error("Images must be 10 MB or smaller.")
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  return writeImageBuffer(buffer, mimeType)
}

export async function saveRemoteImage(
  imageUrl: string,
  mimeType: string | null | undefined,
  fileName?: string | null
) {
  const response = await fetch(imageUrl)
  if (!response.ok) {
    throw new Error(`Failed to fetch remote image (${response.status}).`)
  }

  const resolvedMimeType = resolveSupportedImageMimeType({
    mimeType: mimeType ?? response.headers.get("content-type"),
    fileName,
    imageUrl,
  })
  if (!resolvedMimeType) {
    throw new Error("Only JPG, PNG, WEBP, GIF, and AVIF images are supported.")
  }

  const buffer = Buffer.from(await response.arrayBuffer())
  if (buffer.byteLength <= 0) {
    throw new Error("The remote image is empty.")
  }

  if (buffer.byteLength > MAX_IMAGE_UPLOAD_BYTES) {
    throw new Error("Images must be 10 MB or smaller.")
  }

  const normalizedImage = await normalizeRemoteImageBufferForBrowserCompatibility(buffer).catch(
    () => ({ buffer, mimeType: resolvedMimeType })
  )

  return writeImageBuffer(normalizedImage.buffer, normalizedImage.mimeType)
}
