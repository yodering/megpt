import path from "node:path"
import type { NextConfig } from "next"

const nextConfig: NextConfig = {
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
