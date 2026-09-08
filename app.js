// Theme: "system" (default), "light" or "dark", remembered per browser.
(function () {
  var KEY = 'lb-theme';
  var root = document.documentElement;
  function saved() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function apply(v) {
    if (v === 'light' || v === 'dark') root.setAttribute('data-theme', v);
    else root.removeAttribute('data-theme');
  }
  function effective() {
    var s = saved();
    if (s === 'light' || s === 'dark') return s;
    return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  apply(saved());
  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.getElementById('theme-toggle');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var next = effective() === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem(KEY, next); } catch (e) {}
      apply(next);
    });
  });
})();

// Pulls the latest release from GitHub and updates the download links, version,
// date, size and checksum link. The static hrefs already point at
// /releases/latest/download/<asset>, so the page works even if this script fails.
(function () {
  var REPO = 'ddatunashvili/light_browser';
  var API = 'https://api.github.com/repos/' + REPO + '/releases/latest';
  var CACHE_KEY = 'lb-latest-release';
  var CACHE_TTL = 15 * 60 * 1000; // 15 min: stays well under GitHub's unauthenticated rate limit

  var $ = function (id) { return document.getElementById(id); };
  var lang = (document.documentElement.lang || 'en').slice(0, 2);
  var T = lang === 'ka' ? { released: 'გამოვიდა', latest: 'უახლესი ვერსია', locale: 'ka-GE' }
                        : { released: 'released', latest: 'latest release', locale: 'en-US' };

  function fmtSize(bytes) {
    if (!bytes) return '';
    var mb = bytes / (1024 * 1024);
    return mb >= 1 ? mb.toFixed(1) + ' MB' : Math.round(bytes / 1024) + ' KB';
  }
  function fmtDate(iso) {
    try { return new Date(iso).toLocaleDateString(T.locale, { year: 'numeric', month: 'short', day: 'numeric' }); }
    catch (e) { return ''; }
  }

  function apply(rel) {
    if (!rel || !rel.tag_name || !$('version')) return;
    var assets = rel.assets || [];
    var byName = {};
    assets.forEach(function (a) { byName[a.name] = a; });

    var setup = byName['LightBrowser-Setup.exe'];
    var portable = byName['LightBrowser.exe'];
    var sum = byName['LightBrowser-Setup.exe.sha256'];

    var ver = rel.tag_name.replace(/^v/, '');
    var v = $('version');
    v.textContent = 'v' + ver;
    v.className = 'badge live';
    v.title = rel.name || '';

    var parts = ['Windows 10/11 · 64-bit'];
    if (setup && setup.size) parts.push(fmtSize(setup.size));
    if (rel.published_at) parts.push(T.released + ' ' + fmtDate(rel.published_at));
    if ($('details')) $('details').textContent = parts.join(' · ');

    if (setup && setup.browser_download_url && $('download')) {
      $('download').href = setup.browser_download_url;
      $('download').setAttribute('download', 'LightBrowser-Setup.exe');
    }
    if (portable && portable.browser_download_url && $('portable')) $('portable').href = portable.browser_download_url;
    var deb = null, tgz = null;
    assets.forEach(function (a) { if (/^lightbrowser_.*\.deb$/.test(a.name)) deb = a; if (/^lightbrowser-.*\.tar\.gz$/.test(a.name)) tgz = a; });
    if (deb && $('deb')) { $('deb').href = deb.browser_download_url; }
    if (tgz && $('tgz')) { $('tgz').href = tgz.browser_download_url; }
    if ($('linux-details')) {
      if (deb || tgz) $('linux-details').textContent = 'Ubuntu 24.04+ / Debian 12+ · amd64' + (deb && deb.size ? ' · ' + fmtSize(deb.size) : '');
      else $('linux-details').hidden = true;
    }
    if (sum && sum.browser_download_url && $('checksum')) {
      $('checksum').href = sum.browser_download_url;
      $('checksum-wrap').hidden = false;
    }
    if ($('release-notes-link')) $('release-notes-link').hidden = false;   // points at /releases/
  }

  function load() {
    if (!$('version')) return;
    try {
      var cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
      if (cached && Date.now() - cached.t < CACHE_TTL) { apply(cached.rel); return; }
    } catch (e) {}

    fetch(API, { headers: { Accept: 'application/vnd.github+json' } })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (rel) {
        try { localStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), rel: rel })); } catch (e) {}
        apply(rel);
      })
      .catch(function () {
        // Leave the static "latest" links in place; they still resolve on GitHub.
        $('version').textContent = T.latest;
      });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', load);
  else load();
})();
