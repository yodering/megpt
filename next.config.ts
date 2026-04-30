import path from "node:path"
import type { NextConfig } from "next"

function normalizeBasePath(value: string | undefined) {
  if (!value || value === "/") return undefined

  const withLeadingSlash = value.startsWith("/") ? value : `/${value}`
  return withLeadingSlash.replace(/\/+$/g, "")
}

const basePath = normalizeBasePath(process.env.NEXT_PUBLIC_BASE_PATH)
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://yoder.ing").replace(/\/+$/g, "")

const nextConfig: NextConfig = {
  basePath,
  outputFileTracingRoot: path.resolve(__dirname),
  serverExternalPackages: ["discord.js", "@discordjs/ws", "zlib-sync"],
  async redirects() {
    if (!basePath) return []

    return [
      {
        source: `${basePath}/:path*`,
        has: [{ type: "host", value: "(?:www\\.)?megpt\\.boo" }],
        destination: `${siteUrl}${basePath}/:path*`,
        permanent: true,
        basePath: false,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "(?:www\\.)?megpt\\.boo" }],
        destination: `${siteUrl}${basePath}/:path*`,
        permanent: true,
        basePath: false,
      },
    ]
  },
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "ngrok-skip-browser-warning", value: "true" },
        ],
      },
    ]
  },
}

export default nextConfig
