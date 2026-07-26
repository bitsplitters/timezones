# Time Zone Picker

A small **static** web page that lets a user pick their IANA time zone (e.g. `Europe/Rome`)
from an interactive map and copy it with one click.

It is used by the **bitsplitters — Team Tasks Manager** Discord bot: several bot messages
link here so users can find and paste the exact time-zone identifier the bot expects.

**Live:** https://timezones.bitsplitters.app

## How it works

- A [Leaflet](https://leafletjs.com/) map renders the IANA time-zone polygons from a
  simplified GeoJSON (`data/2023d-combined-simplified.json`).
- The browser auto-detects your zone via `Intl.DateTimeFormat().resolvedOptions().timeZone`.
- Click a zone on the map (or use the auto-detected one) and press **Copy** to copy the
  IANA identifier to the clipboard.

No backend, no database, no tracking: it is a fully static site (HTML + CSS + JS + one GeoJSON).

## Structure

```
index.html         # the page
scripts/map.js     # Leaflet map + picker logic
scripts/leaflet.js # vendored Leaflet 1.9.4
styles/            # custom.css + vendored Leaflet/Bootstrap CSS
images/favicon.png
data/2023d-combined-simplified.json  # time-zone polygons (loaded from /data at runtime)
CNAME              # GitHub Pages custom domain
.nojekyll          # serve files as-is (skip Jekyll)
```

## Deployment (GitHub Pages)

1. Push to the default branch of this repository.
2. Repo **Settings → Pages**: source = default branch, root (`/`).
3. Custom domain is set via the `CNAME` file (`timezones.bitsplitters.app`); add a
   `CNAME` DNS record for `timezones` pointing to `bitsplitters.github.io`.
4. Enable **Enforce HTTPS** (required for the `.app` TLD, which is HSTS-preloaded).

> The site must be served at the **domain root** (as it is on the custom domain): `index.html`
> uses absolute asset paths (`/scripts/...`, `/styles/...`).

## Attributions

- [Leaflet](https://leafletjs.com/) — BSD-2-Clause.
- [Bootstrap](https://getbootstrap.com/) — MIT.
- Map tiles © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors — ODbL.
- Time-zone boundary data derived from OpenStreetMap via
  [timezone-boundary-builder](https://github.com/evansiroky/timezone-boundary-builder) — ODbL.
- Based on an open-source Leaflet time-zone picker.

See [`LICENSE`](./LICENSE) for the full third-party notices.
