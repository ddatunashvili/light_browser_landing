// Releases page: lists every GitHub release of ddatunashvili/light_browser with
// version, date, download links, sizes, download counts and the release notes
// (GitHub-flavoured Markdown subset rendered client-side, HTML-escaped first).
(function () {
  var REPO = 'ddatunashvili/light_browser';
  var API = 'https://api.github.com/repos/' + REPO + '/releases?per_page=50';
  var CACHE_KEY = 'lb-releases';
  var CACHE_TTL = 15 * 60 * 1000;
  var lang = (document.documentElement.lang || 'en').slice(0, 2);
  var T = lang === 'ka' ? {
    latest: 'უახლესი', pre: 'წინასწარი', installer: 'Windows ინსტალერი', portable: 'Windows პორტატული', checksum: 'checksum', deb: 'Linux .deb (Ubuntu/Debian)', tgz: 'Linux არქივი (.tar.gz)',
    downloads: 'ჩამოტვირთვა', released: 'გამოვიდა', noNotes: 'ამ ვერსიას შენიშვნები არ აქვს.', checksums: 'Checksums', other: 'სხვა ფაილები', win: 'Windows', lin: 'Linux', vtTitle: 'ამ ფაილის სკანირების შედეგი VirusTotal-ზე (70+ ანტივირუსი)', helper: 'იმპორტის დამხმარე, ბრაუზერი თავად ტვირთავს საჭიროებისას',
    error: 'ვერსიების სია ვერ ჩაიტვირთა. იხილეთ GitHub-ზე.', empty: 'ვერსიები ჯერ არ არის.', locale: 'ka-GE'
  } : {
    latest: 'Latest', pre: 'Pre-release', installer: 'Windows installer', portable: 'Windows portable', checksum: 'checksum', deb: 'Linux .deb (Ubuntu/Debian)', tgz: 'Linux tarball (.tar.gz)',
    downloads: 'downloads', released: 'released', noNotes: 'No notes for this release.', checksums: 'Checksums', other: 'Other files', win: 'Windows', lin: 'Linux', vtTitle: 'Scan result for this exact file on VirusTotal (70+ antivirus engines)', helper: 'import helper, the browser downloads it itself when needed',
    error: 'Could not load the release list. See GitHub.', empty: 'No releases yet.', locale: 'en-US'
  };

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function fmtSize(b) { if (!b) return ''; var mb = b / 1048576; return mb >= 1 ? mb.toFixed(1) + ' MB' : b >= 1024 ? Math.round(b / 1024) + ' KB' : b + ' B'; }
  function fmtDate(iso) {
    try { return new Date(iso).toLocaleDateString(T.locale, { year: 'numeric', month: 'long', day: 'numeric' }); } catch (e) { return iso.slice(0, 10); }
  }
  function fmtNum(n) { try { return Number(n).toLocaleString(T.locale); } catch (e) { return String(n); } }

  // Inline markdown: code, bold, italics, links, bare URLs, @mentions, #123 issue refs.
  function inline(s) {
    s = esc(s);
    s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
    s = s.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
    s = s.replace(/(^|\s)_([^_]+)_(?=\s|$|[.,;:!?])/g, '$1<i>$2</i>');
    s = s.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    s = s.replace(/(^|[\s(>])(https?:\/\/[^\s<)]+)/g, function (m, pre, url) {
      var label = url.replace(/^https?:\/\/(www\.)?/, '');
      if (label.length > 60) label = label.slice(0, 57) + '…';
      return pre + '<a href="' + url + '" target="_blank" rel="noopener">' + label + '</a>';
    });
    s = s.replace(/(^|\s)@([A-Za-z0-9-]+)/g, '$1<a href="https://github.com/$2" target="_blank" rel="noopener">@$2</a>');
    s = s.replace(/(^|\s)#(\d+)\b/g, '$1<a href="https://github.com/' + REPO + '/issues/$2" target="_blank" rel="noopener">#$2</a>');
    return s;
  }
  function markdown(md) {
    var lines = String(md || '').replace(/\r/g, '').split('\n');
    var out = [], i = 0, inCode = false, code = [], list = null, para = [];
    function flushPara() { if (para.length) { out.push('<p>' + inline(para.join(' ')) + '</p>'); para = []; } }
    function flushList() { if (list) { out.push('<' + list.tag + '>' + list.items.map(function (x) { return '<li>' + inline(x) + '</li>'; }).join('') + '</' + list.tag + '>'); list = null; } }
    for (; i < lines.length; i++) {
      var l = lines[i];
      if (/^```/.test(l)) { if (inCode) { out.push('<pre><code>' + esc(code.join('\n')) + '</code></pre>'); code = []; inCode = false; } else { flushPara(); flushList(); inCode = true; } continue; }
      if (inCode) { code.push(l); continue; }
      var h = /^(#{1,6})\s+(.*)$/.exec(l);
      if (h) { flushPara(); flushList(); var lvl = Math.min(6, h[1].length + 2); out.push('<h' + lvl + '>' + inline(h[2]) + '</h' + lvl + '>'); continue; }
      var li = /^\s*(?:[-*+]|\d+[.)])\s+(.*)$/.exec(l);
      if (li) { flushPara(); var tag = /^\s*\d/.test(l) ? 'ol' : 'ul'; if (!list || list.tag !== tag) { flushList(); list = { tag: tag, items: [] }; } list.items.push(li[1]); continue; }
      if (!l.trim()) { flushPara(); flushList(); continue; }
      if (list && /^\s{2,}/.test(l)) { list.items[list.items.length - 1] += ' ' + l.trim(); continue; }
      flushList(); para.push(l.trim());
    }
    if (inCode) out.push('<pre><code>' + esc(code.join('\n')) + '</code></pre>');
    flushPara(); flushList();
    return out.join('\n');
  }

  var ICON_WIN = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 5.5 11 4.4v7.1H3zm0 13 8 1.1v-7H3zm9 1.2L22 21v-8.4h-10zm0-15.4v7.2h10V3z"/></svg>';
  var ICON_LIN = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2c-2.6 0-4 2-4 4.6 0 1.4-.6 2.3-1.4 3.5C5.4 11.9 4 13.8 4 16c0 .6.1 1.1.3 1.6-.8.4-1.3 1-1.3 1.7 0 1 1.1 1.7 2.5 1.7.9 0 1.7-.3 2.2-.8.9.5 2.1.8 3.3.8h2c1.2 0 2.4-.3 3.3-.8.5.5 1.3.8 2.2.8 1.4 0 2.5-.7 2.5-1.7 0-.7-.5-1.3-1.3-1.7.2-.5.3-1 .3-1.6 0-2.2-1.4-4.1-2.6-5.9C16.6 8.9 16 8 16 6.6 16 4 14.6 2 12 2z"/></svg>';
  function sha(a) { var d = String(a.digest || ''); return /^sha256:[0-9a-f]{64}$/.test(d) ? d.slice(7) : ''; }
  function vtLink(a, cls) {
    var h = sha(a); if (!h) return '';
    return '<a class="' + (cls || 'vt') + '" href="https://www.virustotal.com/gui/file/' + h + '" target="_blank" rel="noopener" title="' + T.vtTitle + '">' + VT_SVG + ' VirusTotal</a>';
  }
  function assetRow(a, label, os) {
    return '<div class="asset">' +
      '<a class="asset-main" href="' + esc(a.browser_download_url) + '" rel="noopener">' +
      '<span class="asset-os">' + (os === 'lin' ? ICON_LIN : ICON_WIN) + '<span>' + (os === 'lin' ? T.lin : T.win) + '</span></span>' +
      '<span class="asset-name">' + esc(label) + '</span>' +
      '<span class="asset-file">' + esc(a.name) + '</span>' +
      '<span class="asset-meta">' + fmtSize(a.size) + (a.download_count ? ' · ' + fmtNum(a.download_count) + ' ' + T.downloads : '') + '</span></a>' +
      vtLink(a) + '</div>';
  }
  var VT_SVG = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3 4 6v6c0 5 3.4 8.4 8 9 4.6-.6 8-4 8-9V6z"/><path d="m9 12 2 2 4-4"/></svg>';
  function sumLink(a) { return '<a href="' + esc(a.browser_download_url) + '" rel="noopener" title="' + esc(a.name) + '">' + esc(a.name.replace(/\.sha256$/, '')) + '</a>'; }

  function render(list) {
    var root = document.getElementById('releases');
    if (!list.length) { root.innerHTML = '<p class="muted">' + T.empty + '</p>'; return; }
    var latestSeen = false;
    root.innerHTML = list.map(function (r) {
      var ver = (r.tag_name || '').replace(/^v/, '');
      var isLatest = !r.prerelease && !r.draft && !latestSeen; if (isLatest) latestSeen = true;
      var assets = r.assets || [], by = {};
      assets.forEach(function (a) { by[a.name] = a; });
      var total = assets.reduce(function (s, a) { return s + (a.download_count || 0); }, 0);
      var rows = [], sums = [], other = [];
      if (by['LightBrowser-Setup.exe']) rows.push(assetRow(by['LightBrowser-Setup.exe'], T.installer, 'win'));
      if (by['LightBrowser.exe']) rows.push(assetRow(by['LightBrowser.exe'], T.portable, 'win'));
      assets.forEach(function (a) { if (/^lightbrowser_.*\.deb$/.test(a.name)) rows.push(assetRow(a, T.deb, 'lin')); });
      assets.forEach(function (a) { if (/^lightbrowser-.*\.tar\.gz$/.test(a.name)) rows.push(assetRow(a, T.tgz, 'lin')); });
      assets.forEach(function (a) {
        if (a.name === 'lbimport.exe') { other.push(sumLink(a) + ' <span class="muted">(' + T.helper + ')</span>'); return; }
        if (/\.sha256$/.test(a.name)) sums.push(sumLink(a));
        else if (!/^LightBrowser(-Setup)?\.exe$/.test(a.name) && !/^lightbrowser.*\.(deb|tar\.gz)$/.test(a.name)) other.push(sumLink(a));
      });
      var extra = (sums.length ? '<p class="sums"><b>' + T.checksums + ':</b> ' + sums.join(' · ') + '</p>' : '') +
                  (other.length ? '<p class="sums"><b>' + T.other + ':</b> ' + other.join(' · ') + '</p>' : '');
      var notes = (r.body || '').trim();
      return '<article class="release" id="' + esc(r.tag_name) + '">' +
        '<header><h2><a href="#' + esc(r.tag_name) + '">v' + esc(ver) + '</a>' +
        (isLatest ? ' <span class="badge live">' + T.latest + '</span>' : '') +
        (r.prerelease ? ' <span class="badge">' + T.pre + '</span>' : '') + '</h2>' +
        '<p class="muted">' + (r.published_at ? T.released + ' ' + fmtDate(r.published_at) : '') +
        (total ? ' · ' + fmtNum(total) + ' ' + T.downloads : '') +
        ' · <a href="' + esc(r.html_url) + '" target="_blank" rel="noopener">GitHub</a></p></header>' +
        (rows.length ? '<div class="assets">' + rows.join('') + '</div>' : '') + extra +
        '<div class="notes">' + (notes ? markdown(notes) : '<p class="muted">' + T.noNotes + '</p>') + '</div>' +
        '</article>';
    }).join('');
    if (location.hash) { var el = document.getElementById(location.hash.slice(1)); if (el) el.scrollIntoView(); }
  }

  function load() {
    var root = document.getElementById('releases');
    try {
      var c = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
      if (c && Date.now() - c.t < CACHE_TTL) { render(c.list); return; }
    } catch (e) {}
    fetch(API, { headers: { Accept: 'application/vnd.github+json' } })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (list) {
        list = (list || []).filter(function (r) { return !r.draft; });
        try { localStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), list: list })); } catch (e) {}
        render(list);
      })
      .catch(function () {
        root.innerHTML = '<p class="muted">' + T.error + ' <a href="https://github.com/' + REPO + '/releases" target="_blank" rel="noopener">github.com/' + REPO + '/releases</a></p>';
      });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', load); else load();
})();
