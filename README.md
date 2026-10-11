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

The build produces `out/`, `netlify-dist/`, and `.static/Caddyfile`. If Caddy is installed locally, `bun start` previews the exported files on port 8080, or the port specified by `PORT`.

## Independent Netlify hosting

MeGPT is deployed from `yodering/megpt` to its own static Netlify site. `netlify.toml` selects Bun, runs `bun run build`, and publishes `netlify-dist`. The Next.js adapter is skipped; the deployment contains no serverless or edge functions.

The build exports the archive under `/megpt` in `netlify-dist`. Explicit local rewrites serve archive pages with or without trailing slashes. Retired API and upload GET/HEAD requests return 410, unsupported methods are rejected by static hosting, and missing archive paths return 404. The generated `archive-manifest.json` records Netlify's deployed commit.

The `yodering/portfolio-react` site's `_redirects` rules proxy `/megpt` to this separate Netlify site. Visitors continue using `https://yoder.ing/megpt`. The portfolio does not download or build MeGPT.

Push changes to this repository's `main` branch to rebuild MeGPT independently. No portfolio deployment is needed unless its proxy configuration changes. No secrets are required for the archive.

The existing Dockerfile and Caddy build output remain available for rollback; Railway is not involved in normal hosting.

## Retire Railway resources

After the Netlify migration succeeds, the MeGPT web service can be stopped. The Dockerfile, Railway configuration, and generated Caddy config remain available for rollback. Reconnect the GitHub source or redeploy through the Railway CLI if a rollback is needed.

Stop the **MeGPT project's Postgres service** if it is still running. Retained volumes and backups may continue to incur storage charges until removed. Deleting volumes and backups permanently discards old conversations and should be handled separately. The static archive contains no old conversations or uploads. Historical Discord threads remain in Discord.

Remove obsolete database, Discord, Google OAuth, NextAuth, and Umami environment variables from retired MeGPT services. Do not modify PJBot or other projects. Building the archive does not itself stop or delete Railway resources.
