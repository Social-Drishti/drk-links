# Dr. Rajneesh Kant — All-in-One Link & Events Hub

A self-contained Progressive Web App (PWA) link-in-bio portal and upcoming-events hub for **Dr. Rajneesh Kant** at Back to Nature Spine Clinic. The entire application lives in a single `index.html` — markup, styles, and JavaScript together — with a service worker for offline support and installability on desktop and mobile.

---

## Quick Start

### Option A — With Node.js / Vite (recommended)

Open the folder in VS Code, then use the integrated terminal (``Ctrl+` ``):

```bash
npm install      # install dependencies
npm run dev      # start dev server at http://localhost:1810
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload at `http://localhost:1810` |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the built `dist/` locally to verify the production output |
| `npm run lint` | Typecheck via `tsc --noEmit` |
| `npm run clean` | Delete `dist/` |

### Option B — With the Live Server extension (no build step)

1. Install the **Live Server** extension (Ritwick Dey).
2. Right-click `index.html` → **Open with Live Server**.

The app is plain HTML/CSS/JS, so it runs immediately with no install. Use this for quick content edits; use `npm run dev` when you want to verify the production build.

> **Not using Vite?** Serving `index.html` from a non-localhost origin will not register the service worker, so offline mode and the install prompt won't be available.

---

## Configuration

Everything is driven by the single `CONFIG` object in `index.html` (near the bottom, above the `ICONS` registry). Edit it and reload — no build step required to change content.

| Key | Purpose |
| --- | --- |
| `app` | App name, short name, description, domain, install-prompt copy |
| `theme` | Primary/hover/accent colors, background, surface, text, font family. Applied at runtime as CSS custom properties |
| `profile` | Name, clinic, bio, verified badge text, banner, avatar |
| `contact` | Default WhatsApp number, phone display/href, toll-free display/href |
| `ctas` | Primary buttons. Set `variant` to `primary`, `outline`, or `whatsapp`; supply `whatsapp` (digits only) instead of `url` for a wa.me link |
| `events` | Array of events — see below |
| `eventSettings` | Section toggles and behavior (see below) |
| `whatsappLinks` | WhatsApp desk shortcuts shown under **WhatsApp Clinic Desks** |
| `links` | Main resource list under **Official Links & Resources** |
| `reviews` | Aggregate Google rating plus per-branch scores and links |
| `appCard` | Patient app promo card and Play Store URL |
| `clinic` | Clinic name, hours, and branch array (address, phone, map URL) |
| `socials` | Social links; `id` selects the icon and hover brand color |
| `footer` | Footer text; `{year}` is replaced with the current year |

### `eventSettings`

| Key | Effect |
| --- | --- |
| `showEventSection` | Show or hide the whole events section |
| `showPastEvents` | Show the collapsible Past Events archive |
| `sortByDate` | Sort events ascending by `date` |
| `enableModal` | Enable the View Details modal |
| `filterByCategory` | Show category filter chips (rendered when 3+ categories exist) |
| `featuredBadgeText` | Label on the featured event card |

---

## Updating Events

Add or edit objects in the `CONFIG.events` array.

```js
{
  id: "event-bengaluru-oct2026",   // unique; also used for calendar link matching
  title: "Event Title",
  description: "Short blurb for the card (clamped to 2 lines).",
  longDescription: "Full details for the modal.\n\nNewlines are preserved.",
  date: "2026-10-10",              // ISO YYYY-MM-DD; drives sorting and past/upcoming split
  dateDisplay: "October 10, 11, 12", // optional; overrides the auto-formatted date
  time: "10:00 AM – 7:00 PM IST",
  location: "Venue address",
  mapUrl: "https://maps.google.com/?q=...",   // optional; adds a Directions button
  category: "Health Camp",         // becomes a filter chip
  status: "upcoming",              // see table below
  featured: true,                  // first featured event gets the hero card
  detailsEnabled: true,            // show the View Details button
  bookingText: "1800-571-8777",    // optional; renders a highlighted booking line
  image: "assets/banner.png"       // optional; falls back to generated gradient artwork
}
```

### `status` values

| Value | Badge shown |
| --- | --- |
| `upcoming` | Green "Upcoming" |
| `coming-soon` | Blue "Coming Soon" |
| `live` | Red pulsing "Live Now" |
| `completed` | Grey "Completed" |
| `cancelled` | Red "Cancelled" |

An event is treated as **past** when `status` is `completed` or `cancelled`, or when `date` is earlier than today (unless `status` is `live`). Past events move into the collapsible archive.

> **Calendar links:** `getGoogleCalendarUrl()` matches specific event IDs to hardcoded date ranges for the current events (`bengaluru`, `oct14`, `oct18`). A new event falls through to a generic single-day window derived from its `date` field.

---

## Updating the PWA

- **Service worker cache version** — bump `CACHE_NAME` in `public/sw.js` (currently `drk-hub-v5`) whenever you ship a change. The `activate` handler deletes all other caches, so bumping the version is what pushes new assets to returning visitors.
- **Theme color** — update `theme_color` in `public/manifest.webmanifest` and the matching `<meta name="theme-color">` in `index.html`.
- **Icons** — replace the PNGs in `public/assets/`. Required: `icon-192.png`, `icon-512.png`, `icon-maskable-512.png`. Also used: `favicon.png`, `apple-touch-icon.png`.

---

## File Structure

```
.
├── index.html            # Entire app: markup, styles, CONFIG, and logic
├── public/               # Copied verbatim into dist/ by Vite
│   ├── sw.js             # Service worker (offline cache, font caching)
│   ├── manifest.webmanifest
│   └── assets/           # PWA icons
├── .vscode/settings.json # Editor + Live Server config
├── vite.config.ts
├── tsconfig.json
├── package.json
└── metadata.json
```

Vite serves everything in `public/` at the site root during development and copies it unchanged into `dist/` on build — so the same `assets/…` and `manifest.webmanifest` paths work in both.

---

## Deployment

```bash
npm run build     # outputs dist/
npm run preview   # verify the production output locally
```

Deploy the contents of `dist/` to any static host (Netlify, Vercel, GitHub Pages, Cloud Storage + CDN, etc.).

**Requirements for the PWA to work in production:**

- Serve over **HTTPS** (service workers require a secure context; `localhost` is exempt).
- Serve `sw.js` from the site root with a `Content-Type` of `text/javascript`.
- Don't rewrite or redirect `index.html` — the service worker precaches `./index.html` directly.

---

## Notes

- No framework, runtime dependencies, or API keys. The app is static and works fully offline after first load.
- The service worker precaches the app shell and caches Google Fonts (Josefin Sans) for offline rendering.
- On iOS, there's no install prompt event — the app shows a guided "Add to Home Screen" walkthrough instead.
