# Run Hearth & Grain locally

This is a Vite + React + Convex app. Follow these steps to run it on your laptop.

## 1. Prerequisites

- [Node.js](https://nodejs.org) 20+ and npm (or [Bun](https://bun.sh))
- A free [Convex](https://convex.dev) account (the backend/database)

## 2. Install dependencies

```bash
npm install
# or: bun install
```

## 3. Create your Convex deployment

```bash
npx convex dev
```

The first run asks you to log in and creates a new project on your Convex
dashboard. It also generates `src/convex/_generated/` (safe to commit or
regenerate at any time) and writes the deployment URL into `.env.local` as
`VITE_CONVEX_URL`. Keep this command running — it syncs your backend.

## 4. In a second terminal, start the web app

```bash
npm run dev
```

Open the printed URL (usually `http://localhost:5173`).

## 5. First-time setup inside the app

1. Go to `/auth` and use the **Sign up** tab (email + password, 8+ chars).
2. The first email account gets a one-click **Claim admin access** banner on
   the dashboard at `/admin`.
3. Load the sample collection (Overview page) or create your own listings.
4. Set your WhatsApp number and site content under **Settings**.

## Deploy to Vercel

The frontend is a static Vite SPA, so it deploys to Vercel in a few minutes. The
backend (database, auth, file storage) stays on your own Convex deployment —
Vercel only serves the web app.

1. **Deploy the Convex backend first** (from your laptop, after `npm install`):

   ```bash
   npx convex dev                  # first run: creates your Convex project + src/convex/_generated
   npx convex env set CONVEX_SITE_URL https://<deployment-name>.convex.site --prod
   npx convex deploy               # pushes functions + auth config to production
   ```

   **`CONVEX_SITE_URL` is required for sign-in to work.** It must be your
   deployment's HTTP-actions URL — note the **`.convex.site`** ending, not
   `.convex.cloud`. The deployment name is the first part of your client URL:
   if `VITE_CONVEX_URL` is `https://calculating-skunk-425.convex.cloud`, the
   site URL is `https://calculating-skunk-425.convex.site`.

   ### Troubleshooting: `InvalidAuthConfig` on `npx convex deploy`

   `The pushed auth config is invalid: Invalid provider domain URL "…"` means an
   environment variable used by `src/convex/auth.config.ts` holds a value that
   isn't a URL. To fix:

   1. Inspect the deployment's variables: `npx convex env list --prod`
   2. Also check any local `.env` / `.env.local` files in the project folder for
      `CONVEX_SITE_URL` or `VLY_CONVEX_AUTH_ISSUER` lines — delete or correct
      anything that isn't a proper `https://…` URL.
   3. `CONVEX_SITE_URL` must be `https://<deployment-name>.convex.site`.
      `VLY_CONVEX_AUTH_ISSUER` is only used by the managed preview environment —
      on your own deployment you can delete that variable entirely.

2. **Push this project to a GitHub repository** (GitHub, GitLab, or Bitbucket
   all work).

3. **In Vercel**: *Add New → Project* → import the repo. Vercel auto-detects
   Vite. Confirm:

   | Setting | Value |
   | --- | --- |
   | Build command | `npm run build` |
   | Output directory | `dist` |
   | Install command | `npm install` |

4. **Add the environment variable** under *Settings → Environment Variables*:

   | Name | Value |
   | --- | --- |
   | `VITE_CONVEX_URL` | Your Convex deployment URL, e.g. `https://your-project-123.convex.cloud` |

   This is baked into the frontend at build time, so it **must** be set before
   the first build. Without it the site shows a blank page.

5. **Deploy.** Every push to your main branch now deploys automatically.

### Alternative: deploy only the frontend, skip the Convex key

You don't need the Convex↔Vercel integration for this app — it talks to Convex
over its public WebSocket/HTTP API from the browser. Just set `VITE_CONVEX_URL`
and deploy. If you later use Convex's Vercel integration (dashboard →
Integrations), it can manage `VITE_CONVEX_URL` for you on each build.

### Notes for production

- `vercel.json` (included) rewrites all paths to `index.html` so deep links like
  `/furniture/sofa-name` and `/admin` work on refresh.
- Add your custom domain in Vercel (*Settings → Domains*) and point DNS at it.
- Auth and admin access work exactly as on the preview: sign up, claim admin,
  and set your content in Settings — the WhatsApp number and site copy live in
  the Convex database, not in the code.
- If you change anything in `src/convex/`, re-run `npx convex deploy` to update
  the backend; the frontend redeploys from your next push.

## Useful scripts

```bash
npm run dev        # Vite dev server
npm run build      # Production build (typechecks first)
npm run preview    # Preview the production build
npx convex dev     # Convex backend sync (keep running alongside)
```

## Notes

- `src/convex/_generated/` is auto-generated; you don't need to edit it.
- All site content (brand, hero copy, contact info, WhatsApp number/CTAs) is
  stored in the database and edited from the admin Settings page — nothing is
  hard-coded.
- The email sign-in provider sends OTP-free: it uses email/username +
  password with Scrypt hashing, entirely on your own Convex deployment.
