This is a Next.js app deployed on Railway with Google auth via NextAuth.

## Local development

Install dependencies and run the app:

```bash
bun install
bun dev
```

Create a `.env.local` with at least:

```bash
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
DATABASE_URL=
DISCORD_BOT_TOKEN=
DISCORD_GUILD_ID=
DISCORD_PARENT_CHANNEL_ID=
DISCORD_NOTIFICATION_CHANNEL_ID=
DISCORD_NOTIFICATION_USER_ID=
DISCORD_NOTIFICATION_ROLE_ID=
NEXT_PUBLIC_UMAMI_SCRIPT_URL=
NEXT_PUBLIC_UMAMI_WEBSITE_ID=
NEXT_PUBLIC_UMAMI_DOMAINS=localhost
```

Google auth uses JWT sessions. `DATABASE_URL` is used for app data such as conversations and messages.

## Railway Postgres setup

1. In Railway, create a `PostgreSQL` service.
2. In your web service, add a variable reference so the app receives the Postgres connection string as `DATABASE_URL`.
3. Set these variables on the web service:

```bash
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXTAUTH_SECRET=
NEXTAUTH_URL=https://your-app.up.railway.app
DATABASE_URL=
DISCORD_BOT_TOKEN=
DISCORD_GUILD_ID=
DISCORD_PARENT_CHANNEL_ID=
DISCORD_NOTIFICATION_CHANNEL_ID=
DISCORD_NOTIFICATION_USER_ID=
DISCORD_NOTIFICATION_ROLE_ID=
```

4. Redeploy the web service. The app will create its own conversation tables on first database use.

Railway usually injects a usable connection string after the services are linked. This project expects the standard `DATABASE_URL`.

Optional Umami analytics:

- `NEXT_PUBLIC_UMAMI_SCRIPT_URL`: tracker script URL, for example `https://stats.example.com/script.js`
- `NEXT_PUBLIC_UMAMI_WEBSITE_ID`: website ID from Umami
- `NEXT_PUBLIC_UMAMI_DOMAINS`: comma-separated hostnames to allow, for example `megpt.boo,www.megpt.boo`
- `NEXT_PUBLIC_UMAMI_HOST_URL`: optional event endpoint override if it differs from the script origin

The app only loads Umami in `production`, sets `data-do-not-track="true"`, and excludes URL search params by default.

## Discord operator inbox

The app supports Discord as the operator surface while keeping Postgres as the source of truth.

- Create a bot in the Discord Developer Portal.
- Enable the `MESSAGE CONTENT INTENT` for the bot.
- Invite the bot to your server with permission to view channels, send messages, create public threads, send messages in threads, and read message history.
- Set `DISCORD_PARENT_CHANNEL_ID` to a normal text channel where the app should create one thread per conversation.
- Optional: set `DISCORD_NOTIFICATION_CHANNEL_ID` to a separate text channel for extra alerts. If unset, no separate alert is sent.
- Optional: set `DISCORD_NOTIFICATION_USER_ID` to ping one user on each mirrored user message in Discord.
- Optional: set `DISCORD_NOTIFICATION_ROLE_ID` to ping a role on each mirrored user message in Discord.

Behavior:

- User messages from the app are saved to Postgres and mirrored into a Discord thread.
- Mirrored user messages can include an optional user or role mention, which is useful if you want phone push notifications.
- Replies written in that Discord thread are saved back into Postgres and streamed to the user UI.
- Image attachments in Discord replies are saved back into Postgres and displayed inline in the user UI.
- The app will auto-create the `discord_threads` table on first database use.

## Supabase cleanup

This repo no longer uses Supabase. Remove these old variables from Railway and from your local `.env.local` if you no longer need them:

```bash
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
SUPABASE_SECRET_KEY
```
