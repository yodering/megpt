import type { NextConfig } from "next"

const value = process.env.NEXT_PUBLIC_BASE_PATH ?? "/megpt"
const basePath = value === "/" || !value ? "" : `/${value.replace(/^\/+|\/+$/g, "")}`

const nextConfig: NextConfig = {
  output: "export",
  turbopack: { root: process.cwd() },
  basePath,
  trailingSlash: true,
}

export default nextConfig
