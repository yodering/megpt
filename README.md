# MeGPT

MeGPT is a basic AI chatbot UI clone built for David Yoder's Radical Software work at Davidson College. It borrows the familiar shape of a ChatGPT-style interface, but the response does not come from a model.

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

Behavior:

- A user message is saved to Postgres.
- The app creates or reuses a Discord thread for that conversation.
- The user message is mirrored into the thread.
- A Discord reply in that thread is saved as David's response.
- The web UI polls for updates and shows the reply to the original user.
- Uploaded images are stored in Postgres and served through `/api/images/:id`.
