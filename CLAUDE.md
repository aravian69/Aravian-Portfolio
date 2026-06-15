# Abdul Aziz Portfolio — Project Context

**Stack:** Next.js (App Router) · TypeScript · Tailwind CSS · Vercel · Bunny CDN  
**Repo:** `aravian69/Aravian-Portfolio` on GitHub → auto-deploys to `rav709.site`  
**Local path:** `C:\Users\txtvi\Downloads\abdul-aziz-portfolio`

---

## Key Files

| File | Purpose |
|---|---|
| `app/layout.tsx` | Root layout, metadata (title, OG, favicon icons), font imports, anti-FOUC script |
| `app/globals.css` | All global styles, CSS variables for dark/light theme, theme-transition class |
| `app/(site)/page.tsx` | Homepage — hero, client strip, CTAs |
| `content/projects/*.yaml` | **Project content** — managed via the Keystatic CMS at `/keystatic` (no code) |
| `keystatic.config.ts` | CMS schema + storage config (see `SETUP-CMS.md`) |
| `lib/projects.ts` | Project types + `CATEGORIES` (client-safe) |
| `lib/projects.server.ts` | `getProjects()` — reads the CMS content at build/server time |
| `components/Nav.tsx` | Nav bar, theme toggle (dark/light), mobile menu |
| `components/BackgroundVideo.tsx` | Ambient background video (loops silently) |
| `components/CustomCursor.tsx` | Custom cursor logic |
| `components/TransitionLoader.tsx` | Page transition overlay |
| `components/Footer.tsx` | Footer |
| `app/icon.svg` | Favicon — square `0 0 1507 1507` viewBox, transparent bg, lime fill `#c8ff00` |
| `public/` | Static assets |

---

## Adding a New Project

Use the **Keystatic CMS** at `/keystatic` (no code). Click **+ Create**, fill the
form (title, category, orientation, Bunny video URL, thumbnail, optional tools/year),
and Publish. Each project is stored as a YAML file in `content/projects/`.
See `SETUP-CMS.md` for the one-time GitHub connection that makes publishing live.

Editing the YAML directly still works. Each `content/projects/<id>.yaml` is:

```yaml
title: "Project Name"
cat: ai            # vfx | color | motion | ai | editing | graphic | 3d
ratio: portrait    # portrait (9:16) | landscape (16:9) | square
desc: "Short label"
videoUrl: "https://player.mediadelivery.net/play/657161/<VIDEO_GUID>"
thumbnail: "https://vz-cbc45619-72d.b-cdn.net/<VIDEO_GUID>/thumbnail.jpg"
images: []
tools: ""
year: null
```

### Bunny CDN — Finding Video GUIDs

Bunny library ID: **`657161`**  
CDN pull zone: `vz-cbc45619-72d.b-cdn.net`

To fetch video GUIDs from a collection:

```bash
# List all collections
curl "https://video.bunnycdn.com/library/657161/collections" \
  -H "AccessKey: <API_KEY>"

# List videos in a collection
curl "https://video.bunnycdn.com/library/657161/videos?collection=<COLLECTION_GUID>" \
  -H "AccessKey: <API_KEY>"
```

Then use the video GUID in both URLs above.  
**Note:** WebFetch cannot send custom headers — always use curl/Bash for Bunny API calls.

---

## Theme System

- Default: `dark`. Persisted to `localStorage` key `aa-theme`.
- Anti-FOUC script in `app/layout.tsx` reads localStorage before React hydrates and sets `data-theme` on `<html>`.
- CSS variables in `globals.css` are scoped to `[data-theme="dark"]` and `[data-theme="light"]`.
- Theme toggle is in `components/Nav.tsx` (`toggleTheme` function).
- Transition class: `html.theme-transitioning` — applies smooth 0.55s fade to all color/bg/border properties. Masonry items are excluded (`transition: none`) to avoid performance hits.

---

## Favicon (`app/icon.svg`)

- Square viewBox: `0 0 1507 1507`
- Transparent background (no `<rect>` fill) — browser tab uses the page background
- Logo path: `fill="#c8ff00"` (lime) with `transform="translate(0, 150)"` for vertical centering
- Referenced in `layout.tsx` metadata as `{ url: '/icon.svg', type: 'image/svg+xml' }`

---

## Mobile Overrides

Inside `globals.css` at `@media (max-width: 768px)`:

```css
.project-modal-title { font-size: 0.95rem; letter-spacing: -0.01em; }
.project-modal-tag   { font-size: 0.6rem;  letter-spacing: 0.1em; }
.modal-close         { font-size: 0.6rem;  padding: 0.5rem 1rem; }
```

---

## Deploy

Push to `main` on GitHub → Vercel auto-deploys. No manual steps needed.

```bash
git add .
git commit -m "your message"
git push
```

Check deploy status at: https://vercel.com/dashboard

---

## Important Constraints

| Rule | Why |
|---|---|
| Logo in nav must be inline SVG | Allows `fill: currentColor` theming |
| Thumbnails use CSS `background-image` | Not `<img>` — masonry layout depends on it |
| Never use `#000` or `#fff` for brand colors | Design system uses OKLCH tinted neutrals |
| No gradient text (`background-clip: text`) | Banned by design system |
| Bunny API needs `AccessKey` header | Use curl, not fetch/WebFetch |
| Favicon must be square viewBox | Google Search and browser tabs require square |
| Keep `anti-FOUC` script in `<head>` | Prevents flash of wrong theme on load |
