# MeGPT archive

MeGPT was an experimental project exploring AI interfaces and human authorship, created by David Yoder for Radical Software at Davidson College. Replies originally came from a human through Discord.

The site is now a static archive. Messaging, authentication, uploads, conversation history, database access, Discord connections, and analytics scripts have been removed. The original implementation remains in Git history.

## Development

Use Bun for package commands:

```sh
bun install
bun dev
bun run lint
bun run build
```

The default URL is `http://localhost:3000/megpt`. Set `NEXT_PUBLIC_BASE_PATH` to an empty string to build for a domain root instead. Both the Next export and generated Caddy configuration use the same build-time value.

The build produces `out/` and `.static/Caddyfile`. If Caddy is installed locally, `bun start` previews the exported files on port 8080, or the port specified by `PORT`.

## Railway hosting

`railway.toml` selects the multi-stage Dockerfile. Bun builds static HTML, CSS, and JavaScript. The final container contains Caddy and the exported files only; it does not contain the Next.js server, Bun, Node, or a database client.

Set these build variables to preserve the public URL:

```text
NEXT_PUBLIC_BASE_PATH=/megpt
NEXT_PUBLIC_SITE_URL=https://yoder.ing
```

Caddy listens on Railway's `PORT`, defaulting to 8080. The existing domain/proxy should continue pointing to the same MeGPT web service. `/` redirects to `/megpt/`, and `/megpt/about/` serves the project explanation. Old `/megpt/api/*` and `/megpt/uploads/*` URLs return HTTP 410. Unknown pages return 404 instead of the homepage.

Keep the MeGPT web service running. It is now just a static file host. Do not enable sleeping if immediate availability is preferred. Caddy still incurs Railway resource usage; savings must be measured after deployment.

## Complete the live retirement

1. Deploy this commit to the existing MeGPT web service, preserving its public networking and reverse proxy. Confirm the archive and About page work at `https://yoder.ing/megpt` and `https://yoder.ing/megpt/about`.
2. Verify that the retired API returns 410 and that no Discord listener remains in the web deployment.
3. Stop the **MeGPT project's Postgres service** after the static deployment succeeds. This stops database compute charges. Its retained volume and backups continue to incur storage charges until removed.
4. If permanently discarding old conversations, delete that database service's volume and backups as a separate irreversible step. The static site never copies or exposes old conversations or images. Any historical Discord threads remain in Discord until separately deleted.
5. Remove obsolete database, Discord, Google OAuth, NextAuth, and Umami environment variables from the MeGPT web service. No secrets are required for the archive. Do not modify PJBot or other projects.

The static build does not itself stop or delete Railway database resources. Railway CLI authentication is required to finish that operational step.
