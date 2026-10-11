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

## Netlify hosting at yoder.ing/megpt

The archive is built into `public/megpt` in the `yodering/portfolio-react` repository. Netlify publishes it with the portfolio's existing `dist` deployment. No separate MeGPT container, backend, or database is needed.

The portfolio's `scripts/build-megpt.mjs` downloads this public repository at a pinned source commit and runs `bun install --frozen-lockfile` followed by `bun run build`. It copies the export into `public/megpt` before Vite builds the portfolio. To refresh the archive, update `sourceCommit` in that script and deploy the portfolio.

The generated `archive-manifest.json` records the source commit. The portfolio's `_redirects` file serves retired `/megpt/api` and `/megpt/uploads` URLs with HTTP 410 for GET and HEAD requests and returns the archive's 404 page for missing paths. Existing files take precedence over that 404 rule. The portfolio's SPA fallback applies after the archive rules.

Deploy and verify `/megpt`, `/megpt/about`, `/megpt/privacy`, `/megpt/terms`, static assets, retired URLs, and unknown URLs before stopping the Railway web service.

## Retire Railway resources

After the Netlify migration succeeds, the MeGPT web service can be stopped. The Dockerfile, Railway configuration, and generated Caddy config remain available for rollback. Reconnect the GitHub source or redeploy through the Railway CLI if a rollback is needed.

Stop the **MeGPT project's Postgres service** if it is still running. Retained volumes and backups may continue to incur storage charges until removed. Deleting volumes and backups permanently discards old conversations and should be handled separately. The static archive contains no old conversations or uploads. Historical Discord threads remain in Discord.

Remove obsolete database, Discord, Google OAuth, NextAuth, and Umami environment variables from retired MeGPT services. Do not modify PJBot or other projects. Building the archive does not itself stop or delete Railway resources.
