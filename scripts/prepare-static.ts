import { mkdir, readFile, writeFile } from "node:fs/promises"

// Match Next's build-time base path; Caddy strips it before serving exported files.
const value = process.env.NEXT_PUBLIC_BASE_PATH ?? "/megpt"
const basePath = value === "/" || !value ? "" : `/${value.replace(/^\/+|\/+$/g, "")}`
if (basePath && !/^\/[a-zA-Z0-9_/-]+$/.test(basePath)) {
  throw new Error("NEXT_PUBLIC_BASE_PATH must contain only URL path segments")
}
const fileServer = `
    root * {$STATIC_ROOT:/srv}
    @retired path /api /api/* /uploads /uploads/*
    respond @retired "MeGPT has concluded." 410
    file_server {
      disable_canonical_uris
    }
`
// The existing public proxy normalizes trailing slashes. Serve both forms without redirects.
const routes = basePath ? `
  @prefixed path ${basePath} ${basePath}/*
  handle @prefixed {
    uri strip_prefix ${basePath}
${fileServer}  }
  handle {${fileServer}  }
` : fileServer
const config = `{
  admin off
  auto_https off
}
:{$PORT:8080} {
  encode gzip
  header X-Content-Type-Options nosniff
${routes}}
`
await mkdir(".static", { recursive: true })
await writeFile(".static/Caddyfile", config)
// Confirm the export exists before allowing a deployment image to be assembled.
await readFile("out/index.html")
console.log(`Static archive prepared at ${basePath || "/"}`)
