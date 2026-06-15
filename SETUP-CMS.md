# Connecting the CMS to GitHub (one-time)

The admin panel lives at **`/keystatic`**. Out of the box it edits files on the
local machine (great for `npm run dev`). To make publishing work on the **live
site** — where clicking *Publish* commits to GitHub and Vercel redeploys — you
connect it to GitHub once. About 10 minutes.

You only ever do this once.

---

## What you need
- Access to the GitHub account that owns `aravian69/Aravian-Portfolio`
- Access to the Vercel project dashboard

## Step 1 — Create a GitHub App
Go to **https://github.com/settings/apps/new** and fill in:

- **GitHub App name:** `Aravian Portfolio CMS` (any name)
- **Homepage URL:** `https://www.rav709.site`
- **Callback URL:** `https://www.rav709.site/api/keystatic/github/oauth/callback`
- **Request user authorization (OAuth) during installation:** ✅ check this
- **Webhook → Active:** ⬜ uncheck (not needed)
- **Permissions → Repository permissions → Contents:** `Read and write`
- **Where can this GitHub App be installed?** `Only on this account`

Click **Create GitHub App**.

## Step 2 — Get the three secrets
On the app's page after creating it:
1. Copy the **Client ID**.
2. Click **Generate a new client secret**, copy it.
3. Make up a long random **session secret** (any 32+ random characters). On a
   Mac/Linux terminal: `openssl rand -hex 32`. On Windows you can use any random
   string generator.
4. Scroll down, click **Install App**, and install it on the
   **Aravian-Portfolio** repository.

## Step 3 — Add 4 variables in Vercel
Vercel → your project → **Settings → Environment Variables**. Add these for the
**Production** environment:

| Name | Value |
|---|---|
| `NEXT_PUBLIC_KEYSTATIC_GITHUB` | `true` |
| `KEYSTATIC_GITHUB_CLIENT_ID` | the Client ID from Step 2 |
| `KEYSTATIC_GITHUB_CLIENT_SECRET` | the client secret from Step 2 |
| `KEYSTATIC_SECRET` | your random session secret from Step 2 |

## Step 4 — Redeploy
Vercel → **Deployments → … → Redeploy** (or just push any commit).

## Step 5 — Use it
Go to **https://www.rav709.site/keystatic**, click **Log in with GitHub**,
authorize, and you're in. From now on:

> **+ Create → fill the form → Publish.** The site updates in a minute or two.

---

## Adding a video, the full flow
1. Upload the video to **Bunny Stream** (your library `657161`) as you do today.
2. Copy its **player URL** (`https://player.mediadelivery.net/play/657161/<guid>`)
   and **thumbnail URL** (`https://vz-cbc45619-72d.b-cdn.net/<guid>/thumbnail.jpg`).
3. In `/keystatic`: **+ Create**, type the title, pick category + orientation,
   paste the two URLs, add an optional description / tools / year, **Publish**.

The grid colour-ordering refreshes automatically on each deploy. A brand-new
project shows at the end of the grid until that finishes, which is harmless.

## Until you connect GitHub
The live `/keystatic` still opens, but it can't save (it's in local mode on a
read-only server). The public site is unaffected and keeps working normally.
