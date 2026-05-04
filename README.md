# MeGPT

MeGPT is a basic AI chatbot UI clone built for David Yoder's Radical Software work at Davidson College. It borrows the familiar shape of a ChatGPT-style interface, but the response does not come from a model. It comes from David.

The project works as a small commentary on AI interfaces, automation, authorship, and trust. A user types into something that looks like a chatbot, waits in the same way they might wait for an assistant, and receives a reply routed through a real person using Discord as the backend inbox.

The app supports guest conversations, Google sign-in, persistent chat history, image uploads, and Discord thread mirroring so each conversation can be handled personally while Postgres remains the source of truth.

## What It Does

- ChatGPT-like UI built with Next.js App Router, React, and Tailwind CSS.
- Guest mode with temporary session IDs, plus optional Google auth through NextAuth.
- Postgres-backed conversations, messages, Discord thread mappings, pins, statuses, and uploaded images.
- One pending user request per conversation, so the app behaves less like instant automation and more like a mediated human reply.
- Discord inbox: user messages create or reuse a Discord thread, and David's replies in that thread are saved back into the app.
- Image uploads from the web app and image replies from Discord.
- Optional Umami analytics.

## Tech Stack

- Runtime/package manager: Bun
- Framework: Next.js 16
- UI: React 19, Tailwind CSS 4, lucide-react, motion
- Auth: NextAuth with Google provider and JWT sessions
- Database: PostgreSQL through `pg`
- Reply surface: Discord bot through `discord.js`
- Image processing: `sharp`

## Repository Layout

```text
app/                  Next.js routes, pages, API handlers, metadata
components/           Chat UI, sidebar, auth/profile controls, shared UI
lib/                  Database, auth, conversations, Discord, uploads, helpers
docs/                 Setup notes and product decisions
public/               Static icons and public assets
```

## Local Development

Use Bun for all package commands.

```bash
bun install
bun dev
```

The dev server runs at:

```text
http://localhost:3000
```

Other useful commands:

```bash
bun run build
bun run start
bun run lint
```

## Environment Variables

Create `.env.local` in the repo root.

```bash
DATABASE_URL=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000

DISCORD_BOT_TOKEN=
DISCORD_GUILD_ID=
DISCORD_PARENT_CHANNEL_ID=
DISCORD_NOTIFICATION_CHANNEL_ID=
DISCORD_NOTIFICATION_USER_ID=
DISCORD_NOTIFICATION_ROLE_ID=

NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_BASE_PATH=
NEXT_PUBLIC_MESSAGE_MAX_CHARS=2000
MAX_IMAGE_UPLOAD_BYTES=10485760
GUEST_CONVERSATION_TTL_MINUTES=30

NEXT_PUBLIC_UMAMI_SCRIPT_URL=
NEXT_PUBLIC_UMAMI_WEBSITE_ID=
NEXT_PUBLIC_UMAMI_DOMAINS=localhost
NEXT_PUBLIC_UMAMI_HOST_URL=
```

### Required For A Minimal Local Run

- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`

Google login requires `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`, but guest chat can work without Google OAuth as long as the database is configured.

Discord mirroring is enabled only when all of these are set:

- `DISCORD_BOT_TOKEN`
- `DISCORD_GUILD_ID`
- `DISCORD_PARENT_CHANNEL_ID`

The notification channel, user mention, and role mention variables are optional.

## Database

The app expects a PostgreSQL connection string in `DATABASE_URL`.

Conversation tables are created automatically on first database use by `lib/db.ts`, including:

- `conversations`
- `messages`
- `discord_threads`
- `uploaded_images`

## Google Auth

This project uses NextAuth with the Google provider.

For local development, add this redirect URI to the Google OAuth client:

```text
http://localhost:3000/api/auth/callback/google
```

For production with a base path, the callback must include the base path. For the current deployed shape:

```text
https://yoder.ing/megpt/api/auth/callback/google
```

More detailed setup notes live in `docs/google-auth-setup.md`.

## Discord Reply Inbox

Discord is the reply surface for the human side of the project.

1. Create a Discord application and bot.
2. Enable the Message Content Intent.
3. Invite the bot to the server with permissions to view channels, send messages, create public threads, send messages in threads, attach files, and read message history.
4. Set `DISCORD_PARENT_CHANNEL_ID` to a normal text channel where the bot can create one thread per MeGPT conversation.
5. Optionally set `DISCORD_NOTIFICATION_CHANNEL_ID`, `DISCORD_NOTIFICATION_USER_ID`, or `DISCORD_NOTIFICATION_ROLE_ID` for extra alerts.

Behavior:

- A user message is saved to Postgres.
- The app creates or reuses a Discord thread for that conversation.
- The user message is mirrored into the thread.
- A Discord reply in that thread is saved as David's response.
- The web UI polls for updates and shows the reply to the original user.
- Uploaded images are stored in Postgres and served through `/api/images/:id`.

## Deployment Notes

The app is designed for Railway:

1. Create a Railway web service for the Next.js app.
2. Create or attach a Railway PostgreSQL service.
3. Expose the Postgres connection string to the web service as `DATABASE_URL`.
4. Set production auth variables:

```bash
NEXTAUTH_URL=https://your-domain.example/optional-base-path
NEXTAUTH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXT_PUBLIC_SITE_URL=https://your-domain.example
NEXT_PUBLIC_BASE_PATH=/optional-base-path
```

5. Set Discord variables if reply mirroring should run in production.
6. Redeploy after changing environment variables.

When deploying at the site root, leave `NEXT_PUBLIC_BASE_PATH` empty. When deploying under `/megpt`, set:

```bash
NEXT_PUBLIC_BASE_PATH=/megpt
NEXTAUTH_URL=https://yoder.ing/megpt
NEXT_PUBLIC_SITE_URL=https://yoder.ing
```

## Optional Analytics

Umami loads only in production when both `NEXT_PUBLIC_UMAMI_SCRIPT_URL` and `NEXT_PUBLIC_UMAMI_WEBSITE_ID` are set.

```bash
NEXT_PUBLIC_UMAMI_SCRIPT_URL=https://stats.example.com/script.js
NEXT_PUBLIC_UMAMI_WEBSITE_ID=
NEXT_PUBLIC_UMAMI_DOMAINS=yoder.ing
NEXT_PUBLIC_UMAMI_HOST_URL=
```

## Notes For Contributors

- Use Bun. Do not use npm commands in this repo.
- Keep Postgres as the source of truth for conversation state.
- Be careful with guest conversations: they are intentionally temporary and cleaned up according to `GUEST_CONVERSATION_TTL_MINUTES`.
- Do not put sensitive user data into test messages; replies are read and written by a real person.
