# Link-in-Bio — Back to Nature Spine Clinic

A single-file, dependency-free "link-in-bio" microsite for the clinic. Everything
(HTML, CSS, JS config, inline SVG icons and the Google Play badge) lives in one
`index.html` — drop it on any static host and it works.

Mobile-first, capped at `460px`, centred on desktop.

## How the page is built

All content is declared in one `CONFIG` object near the top of the `<script>`
block in `index.html`. On load, small DOM-building functions
(`buildProfile`, `buildCtas`, `buildLinks`, `buildApp`, `buildClinic`,
`buildSocials`, `buildFooter`) render the whole page from that object — there
are no hand-written, repeated HTML blocks.

Everything is one source of truth:

- Instagram / YouTube / Facebook appear in **both** the links section and the
  social row, but their URLs are declared only once, in `CONFIG.socials`. The
  link-list entries reference them via `social: "instagram"` etc.
- The "WhatsApp Us" button, the WhatsApp social button, and the phone row all
  draw from `CONFIG.contact.whatsapp`.
- `data-analytics-id` on every clickable element is generated from config
  (`<analytics.prefix>-<kind>-<slug>`, e.g. `rk-cta-book-appointment`,
  `rk-social-instagram`), so click tracking can be attached later without
  touching markup.
- The favicon is a plain static file (`assets/drk-favicon.webp` — the clinic logo);
  the `<title>`/meta tags are synced from `CONFIG` at runtime (see "Social
  sharing" below for the one caveat).

## Editing the CONFIG object

Open `index.html`, find `const CONFIG = { ... }` and change values. Nothing else
on the page needs to move.

| What you change | Where in `CONFIG` |
| --- | --- |
| Doctor name, clinic name, bio | `profile.name`, `profile.clinic`, `profile.bio` |
| Show/hide the verified badge | `profile.verified` (`true` / `false`) |
| Swap avatar photo in | `profile.avatar.image` -> `"assets/avatar.jpg"` (initials fall to `initials` until then) |
| "Book an Appointment" target | `ctas[0].url` |
| WhatsApp number | `contact.whatsapp` (digits only, e.g. `919876543210`) |
| Link-list items | `links` — each item: `icon`, `title`, `subtitle`, `url` |
| Social URLs (once) | `socials` — `url` per entry |
| Patient App / Play Store link | `app.playUrl` |
| Clinic hours | `clinic.hours` |
| Branch phone / info rows | `clinic.branches[*].rows` (`label`, `icon`, `value`, optional `href`) |
| Google Maps directions per branch | `clinic.branches[*].maps.url` |
| Copyright line | `footer.text` |
| Page title / description / og:image | `site` |

### Placeholder audit (important)

Any URL that isn't final yet should stay as `url: "#"` **with** `placeholder:
true`. On every page load the script audits the config and
`console.warn`s a list of every placeholder that still needs a real URL:

```text
[config] 7 placeholder link(s) still need a real URL:
  - (CTA) "Book an Appointment" -> #
  ...
```

Open DevTools → Console after editing to see exactly what's left to fill in —
you'll never ship a `#` by accident, and you don't have to rely on comments.

### Social sharing (og / twitter meta)

The `<head>` contains Open Graph + Twitter Card tags. The JS overwrites their
`content` from `CONFIG.site` on load, but the tag markup itself is static.
For link previews on Instagram/WhatsApp/Facebook/Twitter to look right:

1. The preview image ships as `assets/og-image.png` (1200×630). Once deployed,
   set `site.ogImage` to its **absolute** hosted URL — relative paths don't
   resolve for social scrapers.
2. Set `site.url` to the deployed page URL.
3. If you'd rather keep the static `<meta>` tags the edited source of truth too,
   update the values in `<head>` to match `CONFIG.site` (they're intentionally
   duplicates for scrapers that don't run JavaScript).

## Deploying

No build step. Any static host works.

- **Netlify Drop** — drag the folder containing `index.html` onto
  <https://app.netlify.com/drop> and it's live in ~10 seconds. Customize the URL
  under Site settings → Change site name.
- **GitHub Pages** — push the file to a repo, Settings → Pages → "Deploy from a
  branch", select the branch and `/ (root)`. It'll be served at
  `https://<user>.github.io/<repo>/`.
- **Vercel / Cloudflare Pages** — import the folder as a static project; no
  framework needed.

The file is fully self-contained (inline SVGs, no fonts, scripts or images
fetched from elsewhere), so it behaves identically anywhere.

## Artwork

`assets/drk-favicon.webp` is the clinic logo (converted from the source
`drk-favicon.webp`, downscaled to 64×64). `assets/og-image.png` is a 1200×630
banner built around that same logo — regenerate or replace it with a proper
marketing banner whenever you want. Both are just static files you can
overwrite; no code changes needed.

## Files

- `index.html` — the entire microsite (HTML + inline `<style>` + `<script>` config/render logic)
- `manifest.webmanifest` — web app manifest powering "Add to Home Screen / Install app" on mobile
- `sw.js` — minimal service worker (installability + offline cache; bump `CACHE` to "drk-v2" on changes)
- `assets/drk-favicon.webp` — clinic logo, used as the site favicon
- `assets/og-image.png` — social share preview image, 1200×630
- `assets/avatar.jpg` — optional; drop the real profile photo here and point `profile.avatar.image` at it
- `assets/icon-192.png`, `assets/icon-512.png` — PNG icons generated from the logo (Chrome install)
- `assets/apple-touch-icon.png` — 180×180 PNG icon used by iOS "Add to Home Screen"
- `README.md` — this file

## Install as an app (PWA)

The page ships a web app manifest, PNG icons and a service worker, so mobile
visitors can add it to their home screen.

- **Android (Chrome):** visiting from an HTTPS URL shows an "Add to
  home screen / Install app" prompt once the service worker is active; it can
  also be added from the browser menu.
- **iOS (Safari):** Share → **Add to Home Screen**. No automatic prompt from
  iOS; the `apple-touch-icon` defines the icon.
- Service workers and install only work over **HTTPS** (`file://` / `http://`
  won't install). All the supported static hosts in "Deploying" serve HTTPS.
- To force a cache refresh after changing `index.html`/CSS/assets, bump `CACHE`
  in `sw.js` (e.g. `"drk-v2"`).