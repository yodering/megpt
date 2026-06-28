import { randomUUID } from "crypto"
import { readFile, unlink } from "fs/promises"
import path from "path"
import sharp from "sharp"
import { ensureAppSchema, getDbPool } from "@/lib/db"

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

function getLegacyUploadedImageFilePath(imageUrl: string) {
  const match = imageUrl.match(/^\/(?:api\/)?uploads\/([^/?#]+)$/)
  if (!match) {
    return null
  }

  return path.join(uploadDirectory, match[1])
}

function getStoredImageId(imageUrl: string) {
  const match = imageUrl.match(/^\/api\/images\/([^/?#]+)$/)
  return match?.[1] ?? null
}

function getPublicImageUrl(imageId: string) {
  return `/api/images/${imageId}`
}

async function storeImageBuffer(buffer: Buffer, mimeType: string) {
  const extension = getExtensionForMimeType(mimeType)
  if (!extension) {
    throw new Error("Unsupported image type.")
  }

  await ensureAppSchema()
  const pool = getDbPool()
  const imageId = `${randomUUID()}${extension}`

  await pool.query(
    `INSERT INTO uploaded_images (id, "mimeType", "byteSize", data)
     VALUES ($1, $2, $3, $4)`,
    [imageId, mimeType, buffer.byteLength, buffer]
  )

  return {
    imageId,
    publicUrl: getPublicImageUrl(imageId),
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

  const normalizedBuffer = await sharp(buffer, { animated: true }).png().toBuffer()
  return { buffer: normalizedBuffer, mimeType: "image/png" }
}

export async function readUploadedImageByUrl(imageUrl: string) {
  const imageId = getStoredImageId(imageUrl)
  if (imageId) {
    await ensureAppSchema()
    const pool = getDbPool()
    const result = await pool.query<{
      id: string
      mimeType: string
      data: Buffer
    }>(
      `SELECT id, "mimeType" AS "mimeType", data
       FROM uploaded_images
       WHERE id = $1
       LIMIT 1`,
      [imageId]
    )

    const row = result.rows[0]
    if (!row) {
      return null
    }

    return {
      buffer: row.data,
      mimeType: row.mimeType,
      filePath: null,
      imageId: row.id,
    }
  }

  const filePath = getLegacyUploadedImageFilePath(imageUrl)
  if (!filePath) {
    return null
  }

  const mimeType = getMimeTypeForFileName(filePath)
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
    imageId: null,
  }
}

export async function readUploadedImageByUrlForUser(imageUrl: string, userEmail: string) {
  await ensureUserCanReadImage(imageUrl, userEmail)
  return readUploadedImageByUrl(imageUrl)
}

async function ensureUserCanReadImage(imageUrl: string, userEmail: string) {
  await ensureAppSchema()
  const pool = getDbPool()
  const result = await pool.query<{ id: number }>(
    `SELECT m.id
     FROM messages m
     INNER JOIN conversations c ON c.id = m."conversationId"
     WHERE m."imageUrl" = $1
       AND c."userEmail" = $2
     LIMIT 1`,
    [imageUrl, userEmail]
  )

  if (!result.rowCount) {
    throw new Error("Image not found.")
  }
}

export async function deleteUploadedImageByUrl(imageUrl: string | null | undefined) {
  if (!imageUrl) return

  const imageId = getStoredImageId(imageUrl)
  if (imageId) {
    await ensureAppSchema()
    const pool = getDbPool()
    await pool.query(`DELETE FROM uploaded_images WHERE id = $1`, [imageId]).catch(() => undefined)
    return
  }

  const filePath = getLegacyUploadedImageFilePath(imageUrl)
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
  return storeImageBuffer(buffer, mimeType)
}

export async function saveRemoteImage(
  imageUrl: string,
  mimeType: string | null | undefined,
  fileName?: string | null
) {
  const response = await fetch(imageUrl, {
    headers: {
      Accept: "image/avif,image/webp,image/png,image/jpeg,image/gif,*/*",
      "User-Agent": "MeGPT image fetcher",
    },
  })
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

  return storeImageBuffer(normalizedImage.buffer, normalizedImage.mimeType)
}
