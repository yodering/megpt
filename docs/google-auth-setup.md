# Google Auth Setup For `megpt.boo`

This project uses NextAuth with Google Sign-In.

## Railway env vars

Set these on the Railway web service:

```bash
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://megpt.boo
DATABASE_URL=...
```

If you still have an old Railway domain configured anywhere, do not use it as `NEXTAUTH_URL` after switching to `megpt.boo`.

## Google Cloud setup

In Google Cloud Console:

1. Go to `Google Auth Platform`.
2. Configure the consent screen.
3. Create or edit an OAuth client of type `Web application`.

## Exact OAuth values to use

For the OAuth client:

- Authorized JavaScript origins:
  - `https://megpt.boo`
  - `http://localhost:3000`

- Authorized redirect URIs:
  - `https://megpt.boo/api/auth/callback/google`
  - `http://localhost:3000/api/auth/callback/google`

The redirect URI must match exactly, including scheme and path, per Google’s OAuth docs: https://developers.google.com/identity/protocols/oauth2/web-server

## Consent screen

For the consent screen:

- App name: `MeGPT`
- Support email: your email
- Audience: `External`
- Developer contact email: your email

If the app is still in testing mode, add your Google account under `Test users`, per Google’s consent screen docs: https://developers.google.com/workspace/guides/configure-oauth-consent

## Authorized domains

Add `megpt.boo` as an authorized domain in the consent screen settings.

If Google asks for verification later, Google says the domain used by your home page, privacy policy, terms page, and redirect URIs must be verified in Search Console: https://developers.google.com/identity/protocols/oauth2/production-readiness/brand-verification

## Public URLs for Google review

This app now has public pages you can use in the consent screen:

- Home page: `https://megpt.boo`
- Privacy policy: `https://megpt.boo/privacy`
- Terms of service: `https://megpt.boo/terms`

## Common failure points

If login fails, check these first:

1. `NEXTAUTH_URL` must be exactly `https://megpt.boo`
2. Google redirect URI must be exactly `https://megpt.boo/api/auth/callback/google`
3. If the consent screen is in testing mode, your Google email must be listed as a test user
4. `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in Railway must belong to the same OAuth client
5. Railway must be redeployed after env var changes

## What the current code expects

Google login can work for any allowed Google account, and Railway Postgres is used for conversations and messages, not for NextAuth account/session tables.
