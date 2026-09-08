# Light Browser — landing page

Static site (vanilla HTML/CSS/JS), served by GitHub Pages:
**https://lightbrowser.net/**

Pages:

- `/` English landing, `/ka/` Georgian landing (hreflang-linked, shared `style.css` / `app.js`).
- `/releases/` and `/ka/releases/`: every GitHub release with notes, downloads, sizes and
  download counts, rendered client-side by `releases.js` from the GitHub API (15-min cache).
- `/filters/adblock.txt`: the curated ad-filter list the browser downloads daily
  (alongside public hosts lists). Keep it in sync with `filters/adblock.txt` in the
  browser repo; pushing here updates every installed browser within a day, no release needed.
- `/og-image.png`: 1200×630 social preview built from the logo.

The download buttons always point at the newest release:

- Static hrefs use GitHub's permanent `…/releases/latest/download/<asset>` URLs, which redirect to the current release with no JavaScript.
- `app.js` additionally fetches `…/repos/ddatunashvili/light_browser/releases/latest` and fills in version, size, date and checksum link (cached 15 min in `localStorage`).

Nothing here needs editing when a new version ships; publishing a release on
[ddatunashvili/light_browser](https://github.com/ddatunashvili/light_browser/releases) is enough.
