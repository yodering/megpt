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
ADMIN_EMAIL=you@example.com
DATABASE_URL=
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
```

If `DATABASE_URL` is omitted, auth falls back to JWT sessions. If `DATABASE_URL` is set, NextAuth stores users, linked Google accounts, and sessions in Postgres.

## Railway Postgres setup

1. In Railway, create a `PostgreSQL` service.
2. In your web service, add a variable reference so the app receives the Postgres connection string as `DATABASE_URL`.
3. Set these variables on the web service:

```bash
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXTAUTH_SECRET=
NEXTAUTH_URL=https://your-app.up.railway.app
ADMIN_EMAIL=you@example.com
DATABASE_URL=
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
```

4. Run the SQL in [`sql/auth-schema.sql`](/Users/yoder/Documents/DIG345/megpt/sql/auth-schema.sql) against the Railway Postgres database.
5. Run the SQL in [`sql/app-schema.sql`](/Users/yoder/Documents/DIG345/megpt/sql/app-schema.sql) against the Railway Postgres database.
6. Redeploy the web service.

Railway usually injects a usable connection string after the services are linked. This project expects the standard `DATABASE_URL`.

`ADMIN_EMAIL` is the only Google account allowed to access `/admin`.

## Supabase cleanup

This repo no longer uses Supabase. Remove these old variables from Railway and from your local `.env.local` if you no longer need them:

```bash
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
SUPABASE_SECRET_KEY
```
