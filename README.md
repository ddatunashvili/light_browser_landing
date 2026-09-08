# Light Browser — landing page

Static site (vanilla HTML/CSS/JS), served by GitHub Pages:
**https://lightbrowser.net/**

The download buttons always point at the newest release:

- Static hrefs use GitHub's permanent `…/releases/latest/download/<asset>` URLs, which redirect to the current release with no JavaScript.
- `app.js` additionally fetches `…/repos/ddatunashvili/light_browser/releases/latest` and fills in version, size, date, checksum link and release-notes link (cached 15 min in `localStorage`).

Nothing here needs editing when a new version ships; publishing a release on
[ddatunashvili/light_browser](https://github.com/ddatunashvili/light_browser/releases) is enough.
