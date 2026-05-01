import path from "node:path"
import type { NextConfig } from "next"

function normalizeBasePath(value: string | undefined) {
  if (!value || value === "/") return undefined

  const withLeadingSlash = value.startsWith("/") ? value : `/${value}`
  return withLeadingSlash.replace(/\/+$/g, "")
}

const basePath = normalizeBasePath(process.env.NEXT_PUBLIC_BASE_PATH)

const nextConfig: NextConfig = {
  basePath,
  outputFileTracingRoot: path.resolve(__dirname),
  serverExternalPackages: ["discord.js", "@discordjs/ws", "zlib-sync"],
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
