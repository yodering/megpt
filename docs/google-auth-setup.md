# Google Auth Setup For `yoder.ing/megpt`

This project uses NextAuth with Google Sign-In.

## Railway Env Vars

Set these on the Railway web service:

```bash
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://yoder.ing/megpt
NEXT_PUBLIC_SITE_URL=https://yoder.ing
NEXT_PUBLIC_BASE_PATH=/megpt
DATABASE_URL=...
```

## Google Cloud Setup

In Google Cloud Console:

1. Go to `Google Auth Platform`.
2. Configure the consent screen.
3. Create or edit an OAuth client of type `Web application`.

## Exact OAuth Values To Use

For the OAuth client:

- Authorized JavaScript origins:
  - `https://yoder.ing`
  - `http://localhost:3000`

- Authorized redirect URIs:
  - `https://yoder.ing/megpt/api/auth/callback/google`
  - `http://localhost:3000/api/auth/callback/google`

The redirect URI must match exactly, including scheme, base path, and callback path.

## Consent Screen

For the consent screen:

- App name: `MeGPT`
- Support email: your email
- Audience: `External`
- Developer contact email: your email

If the app is still in testing mode, add your Google account under `Test users`.

## Authorized Domains

Add `yoder.ing` as an authorized domain in the consent screen settings.

## Public URLs For Google Review

This app has public pages you can use in the consent screen:

- Home page: `https://yoder.ing/megpt`
- Privacy policy: `https://yoder.ing/megpt/privacy`
- Terms of service: `https://yoder.ing/megpt/terms`

## Common Failure Points

If login fails, check these first:

1. `NEXTAUTH_URL` must be exactly `https://yoder.ing/megpt`.
2. Google redirect URI must be exactly `https://yoder.ing/megpt/api/auth/callback/google`.
3. `NEXT_PUBLIC_BASE_PATH` must be exactly `/megpt`.
4. If the consent screen is in testing mode, your Google email must be listed as a test user.
5. `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in Railway must belong to the same OAuth client.
6. Railway must be redeployed after env var changes.

## What The Current Code Expects

Google login can work for any allowed Google account, and Railway Postgres is used for conversations and messages, not for NextAuth account/session tables.
