import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises"

const value = process.env.NEXT_PUBLIC_BASE_PATH ?? "/megpt"
const basePath = value === "/" || !value ? "" : `/${value.replace(/^\/+|\/+$/g, "")}`
if (basePath && !/^\/[a-zA-Z0-9_/-]+$/.test(basePath)) {
  throw new Error("NEXT_PUBLIC_BASE_PATH must contain only URL path segments")
}
await readFile("out/index.html")
await rm("netlify-dist", { recursive: true, force: true })
await mkdir("netlify-dist", { recursive: true })
await cp("out", `netlify-dist${basePath || "/"}`, { recursive: true })
await writeFile(`netlify-dist${basePath}/retired.html`, '<!doctype html><html lang="en"><meta charset="utf-8"><title>MeGPT has concluded</title><p>MeGPT has concluded.</p></html>\n')
await writeFile(`netlify-dist${basePath}/archive-manifest.json`, JSON.stringify({
  repository: "https://github.com/yodering/megpt",
  commit: process.env.COMMIT_REF ?? "local",
  basePath,
}, null, 2) + "\n")

// Local rewrites serve both slash forms without the old proxy's redirect loops.
const pages = ["", "/about", "/privacy", "/terms"]
const routes = pages.map(page => `${basePath}${page || "/"} ${basePath}${page}/index.html 200!`)
if (basePath) {
  routes[0] = `${basePath} ${basePath}/index.html 200!`
  routes.unshift(`/ ${basePath}/index.html 200!`)
}
for (const path of ["api", "uploads"]) {
  routes.push(`${basePath}/${path} ${basePath}/retired.html 410!`)
  routes.push(`${basePath}/${path}/* ${basePath}/retired.html 410!`)
}
// Existing exports shadow this rule. Missing paths get a real 404.
routes.push(`${basePath}/* ${basePath}/404.html 404`)
await writeFile("netlify-dist/_redirects", routes.join("\n") + "\n")
await writeFile("netlify-dist/_headers", `${basePath}/*\n  X-Content-Type-Options: nosniff\n`)
console.log(`Netlify archive prepared at ${basePath || "/"}`)
