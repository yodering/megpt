function normalizeBasePath(value: string | undefined) {
  if (!value || value === "/") return ""

  const withLeadingSlash = value.startsWith("/") ? value : `/${value}`
  return withLeadingSlash.replace(/\/+$/g, "")
}

export const APP_BASE_PATH = normalizeBasePath(process.env.NEXT_PUBLIC_BASE_PATH)
export const NEXT_AUTH_BASE_PATH = `${APP_BASE_PATH}/api/auth`

export function appPath(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`

  if (!APP_BASE_PATH) {
    return normalizedPath
  }

  if (normalizedPath === "/") {
    return APP_BASE_PATH
  }

  return `${APP_BASE_PATH}${normalizedPath}`
}
