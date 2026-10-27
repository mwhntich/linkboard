/* LinkBoard — new tab bookmark workspace */
'use strict';

// ---------- icons ----------
const I = {
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  download: '<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/>',
  upload: '<path d="M12 21V9"/><path d="m7 14 5-5 5 5"/><path d="M5 3h14"/>',
  incognito: '<path d="M3 11h18"/><path d="M5.5 11 7.5 5h9l2 6"/><circle cx="7" cy="17" r="3"/><circle cx="17" cy="17" r="3"/><path d="M10 17h4"/>',
  select: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><path d="m14 17.5 2.2 2.2L21 15"/>',
  trash: '<path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M6 6l1 15h10l1-15"/><path d="M10 11v6M14 11v6"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  eyeOff: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/><path d="M3 3l18 18"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
  image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  plusCircle: '<circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  dots: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
  restore: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
  external: '<path d="M14 3h7v7"/><path d="M10 14 21 3"/><path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"/>',
  move: '<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>',
  bookmark: '<path d="M6 3h12v18l-6-4-6 4z"/>',
  file: '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6"/>',
};
const svg = (n) => `<svg viewBox="0 0 24 24">${I[n]}</svg>`;

// ---------- helpers ----------
const $ = (s, r = document) => r.querySelector(s);
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
function h(tag, props = {}, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (v == null) continue;
    if (k === 'class') el.className = v;
    else if (k === 'html') el.innerHTML = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (k in el && k !== 'list') el[k] = v;
    else if (v !== false) el.setAttribute(k, v);
  }
  for (const c of kids.flat()) if (c != null && c !== false) el.append(c.nodeType ? c : document.createTextNode(c));
  return el;
}
const hostOf = (u) => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return u; } };
function normUrl(u) {
  u = (u || '').trim();
  if (!u) return '';
  if (!/^[a-z][a-z0-9+.-]*:/i.test(u)) u = 'https://' + u;
  return u;
}
// Site logo: try Google's favicon service (real logos even for unvisited sites), then DuckDuckGo,
// then Chrome's own favicon cache, then a letter badge. The working source is remembered per host.
const favCache = (() => { try { return JSON.parse(localStorage.getItem('favCache') || '{}'); } catch { return {}; } })();
const favSources = (u) => {
  const host = hostOf(u);
  return [
    `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=64`,
    `https://icons.duckduckgo.com/ip3/${encodeURIComponent(host)}.ico`,
    `chrome-extension://${chrome.runtime.id}/_favicon/?pageUrl=${encodeURIComponent(u)}&size=32`,
  ];
};
function favicon(url) {
  const host = hostOf(url);
  const letter = () => h('span', { class: 'fav fav-letter' }, (host[0] || '?').toUpperCase());
  if (!/^https?:/i.test(url)) return letter();
  const srcs = favSources(url);
  let i = favCache[host] ?? 0;
  const img = h('img', { class: 'fav', alt: '', draggable: false, referrerPolicy: 'no-referrer' });
  const next = () => {
    if (++i >= srcs.length) return img.replaceWith(letter());
    img.src = srcs[i];
  };
  img.onerror = next;
  img.onload = () => {
    // Google returns a tiny generic globe when it has no icon; skip it
    if (i === 0 && img.naturalWidth <= 16) return next();
    if (favCache[host] !== i) { favCache[host] = i; try { localStorage.setItem('favCache', JSON.stringify(favCache)); } catch {} }
  };
  img.src = srcs[i];
  return img;
}

// ---------- state ----------
const DEFAULT_SETTINGS = { accent: '#f0c27b', privacy: false, incognito: false, newTab: false, dim: 0.2, blur: 0, col: 300, v: 2, preset: 'valley' };
const PRESETS = [
  { id: 'valley', name: 'Storm valley', src: 'wallpapers/valley.jpg', thumb: 'wallpapers/valley-thumb.jpg' },
  { id: 'chrome', name: 'Liquid chrome', src: 'wallpapers/chrome.jpg', thumb: 'wallpapers/chrome-thumb.jpg' },
];
let state, wallpaper = null, lastRev = null;
let selecting = false;
const selected = new Set();

const page = () => state.pages.find((p) => p.id === state.activePage) || state.pages[0];
function findLink(id) {
  for (const p of state.pages) for (const b of p.boards) {
    const i = b.links.findIndex((l) => l.id === id);
    if (i > -1) return { page: p, board: b, link: b.links[i], index: i };
  }
  return null;
}
function findBoard(id) {
  for (const p of state.pages) {
    const i = p.boards.findIndex((b) => b.id === id);
    if (i > -1) return { page: p, board: p.boards[i], index: i };
  }
  return null;
}

async function load() {
  const d = await chrome.storage.local.get(['state', 'wallpaper']);
  state = d.state || { pages: [{ id: uid(), name: 'Home', boards: [] }], trash: [] };
  state.trash ||= [];
  if (state.settings && !state.settings.v) { state.settings.col = 300; state.settings.v = 2; }
  state.settings = { ...DEFAULT_SETTINGS, ...(state.settings || {}) };
  if (!state.pages.length) state.pages.push({ id: uid(), name: 'Home', boards: [] });
  if (!state.pages.some((p) => p.id === state.activePage)) state.activePage = state.pages[0].id;
  lastRev = state._rev;
  wallpaper = d.wallpaper || null;
}
function save() {
  state._rev = lastRev = uid();
  return chrome.storage.local.set({ state });
}
function commit() { save(); render(); }

chrome.storage.onChanged.addListener((ch, area) => {
  if (area !== 'local') return;
  if (ch.state && ch.state.newValue && ch.state.newValue._rev !== lastRev) {
    state = ch.state.newValue;
    state.settings = { ...DEFAULT_SETTINGS, ...(state.settings || {}) };
    state.trash ||= [];
    lastRev = state._rev;
    render();
  }
  if (ch.wallpaper) { wallpaper = ch.wallpaper.newValue || null; applyLook(); }
});

// ---------- look ----------
function applyLook() {
  const s = state.settings, r = document.documentElement.style;
  r.setProperty('--accent', s.accent);
  r.setProperty('--dim', s.dim);
  r.setProperty('--wblur', s.blur + 'px');
  r.setProperty('--col', s.col + 'px');
  const preset = PRESETS.find((p) => p.id === s.preset);
  $('#bg').style.backgroundImage = wallpaper ? `url("${wallpaper}")` : preset ? `url("${preset.src}")` : '';
  document.body.classList.toggle('privacy', s.privacy);
  document.body.classList.toggle('selecting', selecting);
  const set = (id, icon, cls, tip) => { const b = $(id); b.innerHTML = svg(icon); b.className = 'fab ' + (cls || ''); if (tip) b.dataset.tip = tip; };
  set('#btn-privacy', s.privacy ? 'eyeOff' : 'eye', s.privacy ? 'on' : '', s.privacy ? 'Privacy blur ON - click to disable' : 'Privacy blur');
  set('#btn-incognito', 'incognito', s.incognito ? 'on-accent' : '', s.incognito ? 'Incognito ON - links open privately' : 'Open links in Incognito');
  set('#btn-select', 'select', selecting ? 'on-accent' : '');
}

// ---------- render ----------
function render() {
  applyLook();
  renderTabs();
  renderGrid();
  renderSelbar();
  if (drawerView) drawerViews[drawerView](true);
}

function renderTabs() {
  const nav = $('#tabs');
  nav.replaceChildren();
  for (const p of state.pages) {
    const t = h('button', { class: 'tab' + (p.id === state.activePage ? ' active' : ''), title: 'Double-click to rename, right-click for options' }, p.name);
    t.onclick = () => { state.activePage = p.id; commit(); };
    t.ondblclick = () => renamePage(p);
    t.oncontextmenu = (e) => {
      e.preventDefault();
      menu(e.clientX, e.clientY, [
        ['edit', 'Rename', () => renamePage(p)],
        ['trash', 'Delete page', () => deletePage(p), state.pages.length > 1 ? 'danger' : null],
      ]);
    };
    // drop links / boards onto a page tab to move them there
    t.ondragover = (e) => { if (drag && p.id !== page().id) { e.preventDefault(); t.classList.add('drop'); } };
    t.ondragleave = () => t.classList.remove('drop');
    t.ondrop = (e) => {
      e.preventDefault(); t.classList.remove('drop');
      if (!drag) return;
      if (drag.type === 'board') moveBoardToPage(drag.id, p);
      else if (drag.type === 'link') moveLinksToPage([drag.id], p);
      drag = null;
    };
    nav.append(t);
  }
  nav.append(h('button', { class: 'tab tab-add', html: svg('plus'), title: 'New page', onclick: addPage }));
}

function renderGrid() {
  const grid = $('#grid');
  grid.replaceChildren();
  for (const b of page().boards) grid.append(boardEl(b));
  grid.append(h('button', { class: 'add-board', html: svg('plusCircle') + '<span>ADD BOARD</span>', onclick: addBoard }));
}

function boardEl(b) {
  const el = h('section', { class: 'board' });
  el.dataset.id = b.id;
  const head = h('header', { class: 'board-head', draggable: true },
    h('h2', { title: b.title }, b.title),
    h('span', { class: 'count' }, b.links.length || ''),
    h('button', { class: 'icon-btn', html: svg('dots'), title: 'Board options', onclick: (e) => boardMenu(e, b) }),
  );
  head.querySelector('h2').ondblclick = () => renameBoard(b);
  head.ondragstart = (e) => {
    drag = { type: 'board', id: b.id };
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', b.title);
    e.dataTransfer.setDragImage(el, 30, 20);
    requestAnimationFrame(() => el.classList.add('dragging'));
  };
  head.ondragend = () => { el.classList.remove('dragging'); clearDropMarks(); drag = null; };

  const ul = h('ul', { class: 'links' });
  if (!b.links.length) ul.append(h('li', { class: 'empty' }, 'Drop links here or add one below'));
  for (const l of b.links) ul.append(linkEl(l, b));
  wireLinkDrop(ul, b);

  // board reorder
  el.ondragover = (e) => {
    if (!drag || drag.type !== 'board' || drag.id === b.id) return;
    e.preventDefault();
    const r = el.getBoundingClientRect();
    const after = e.clientX > r.left + r.width / 2;
    clearDropMarks();
    el.classList.add(after ? 'drop-after' : 'drop-before');
  };
  el.ondragleave = (e) => { if (!el.contains(e.relatedTarget)) el.classList.remove('drop-before', 'drop-after'); };
  el.ondrop = (e) => {
    if (!drag || drag.type !== 'board') return;
    e.preventDefault();
    const after = el.classList.contains('drop-after');
    clearDropMarks();
    const boards = page().boards;
    const from = boards.findIndex((x) => x.id === drag.id);
    if (from < 0) return;
    const [mv] = boards.splice(from, 1);
    let to = boards.findIndex((x) => x.id === b.id) + (after ? 1 : 0);
    boards.splice(to, 0, mv);
    drag = null;
    commit();
  };

  el.append(head, ul, h('button', { class: 'add-link', html: svg('plus') + 'Add link', onclick: () => addLink(b) }));
  return el;
}

function linkEl(l, b) {
  const li = h('li', { class: 'link', draggable: !selecting, title: l.url });
  li.dataset.id = l.id;
  const a = h('a', { href: l.url, draggable: false }, l.title || hostOf(l.url));
  if (selecting) {
    const cb = h('input', { type: 'checkbox', checked: selected.has(l.id) });
    cb.onclick = (e) => e.stopPropagation();
    cb.onchange = () => { cb.checked ? selected.add(l.id) : selected.delete(l.id); renderSelbar(); };
    li.append(cb);
    li.onclick = (e) => { e.preventDefault(); cb.checked = !cb.checked; cb.onchange(); };
  } else {
    li.onclick = (e) => {
      if (e.target.closest('.acts')) return;
      e.preventDefault();
      openUrl(l.url, e.ctrlKey || e.metaKey || e.button === 1);
    };
    li.onauxclick = (e) => { if (e.button === 1) { e.preventDefault(); openUrl(l.url, true); } };
  }
  li.append(
    favicon(l.url), a,
    h('span', { class: 'acts' },
      h('button', { class: 'icon-btn', html: svg('edit'), title: 'Edit', onclick: (e) => { e.stopPropagation(); editLink(l); } }),
      h('button', { class: 'icon-btn danger', html: svg('x'), title: 'Delete', onclick: (e) => { e.stopPropagation(); deleteLinks([l.id]); } }),
    ),
  );
  li.ondragstart = (e) => {
    drag = { type: 'link', id: l.id };
    e.dataTransfer.effectAllowed = 'copyMove';
    e.dataTransfer.setData('text/uri-list', l.url);
    e.dataTransfer.setData('text/plain', l.url);
    requestAnimationFrame(() => li.classList.add('dragging'));
  };
  li.ondragend = () => { li.classList.remove('dragging'); clearDropMarks(); drag = null; };
  return li;
}

// ---------- drag & drop ----------
let drag = null;
function clearDropMarks() {
  document.querySelectorAll('.drop-above,.drop-below,.drop-before,.drop-after,.drop-zone,.tab.drop')
    .forEach((x) => x.classList.remove('drop-above', 'drop-below', 'drop-before', 'drop-after', 'drop-zone', 'drop'));
}
function dropIndex(ul, y) {
  const items = [...ul.querySelectorAll('.link:not(.dragging)')];
  for (let i = 0; i < items.length; i++) {
    const r = items[i].getBoundingClientRect();
    if (y < r.top + r.height / 2) return { i, el: items[i], pos: 'above' };
  }
  return { i: items.length, el: items[items.length - 1], pos: 'below' };
}
function wireLinkDrop(ul, b) {
  const external = (e) => !drag && [...e.dataTransfer.types].some((t) => t === 'text/uri-list' || t === 'text/plain');
  ul.ondragover = (e) => {
    if (!(drag && drag.type === 'link') && !external(e)) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = drag ? 'move' : 'copy';
    clearDropMarks();
    const t = dropIndex(ul, e.clientY);
    if (t.el) t.el.classList.add('drop-' + t.pos); else ul.classList.add('drop-zone');
  };
  ul.ondragleave = (e) => { if (!ul.contains(e.relatedTarget)) clearDropMarks(); };
  ul.ondrop = (e) => {
    e.preventDefault();
    const t = dropIndex(ul, e.clientY);
    clearDropMarks();
    // count only non-dragging items, so the index maps correctly after removal
    if (drag && drag.type === 'link') {
      const src = findLink(drag.id);
      if (!src) return;
      src.board.links.splice(src.index, 1);
      b.links.splice(Math.min(t.i, b.links.length), 0, src.link);
      drag = null;
      return commit();
    }
    const raw = e.dataTransfer.getData('text/uri-list') || e.dataTransfer.getData('text/plain');
    const urls = raw.split(/\r?\n/).map((s) => s.trim()).filter((s) => s && !s.startsWith('#') && /^(https?|ftp|file):|^[\w-]+\.[\w.-]+/i.test(s));
    if (!urls.length) return;
    b.links.splice(t.i, 0, ...urls.map((u) => ({ id: uid(), title: hostOf(normUrl(u)), url: normUrl(u), added: Date.now() })));
    commit();
    toast(`Added ${urls.length} link${urls.length > 1 ? 's' : ''} to ${b.title}`);
  };
}

// ---------- open ----------
function openUrl(url, background = false) {
  if (state.settings.incognito) {
    chrome.windows.create({ url, incognito: true }).catch(() =>
      toast('Allow LinkBoard in Incognito (chrome://extensions → Details) to use this'));
    return;
  }
  if (background) return chrome.tabs.create({ url, active: false });
  if (state.settings.newTab) return chrome.tabs.create({ url });
  chrome.tabs.getCurrent((t) => (t ? chrome.tabs.update(t.id, { url }) : (location.href = url)));
}

// ---------- pages ----------
async function addPage() {
  const v = await modal({ title: 'New page', fields: [{ name: 'name', label: 'Page name', placeholder: 'e.g. Work' }], ok: 'Create' });
  if (!v || !v.name.trim()) return;
  const p = { id: uid(), name: v.name.trim(), boards: [] };
  state.pages.push(p);
  state.activePage = p.id;
  commit();
}
async function renamePage(p) {
  const v = await modal({ title: 'Rename page', fields: [{ name: 'name', label: 'Page name', value: p.name }], ok: 'Save' });
  if (v && v.name.trim()) { p.name = v.name.trim(); commit(); }
}
function deletePage(p) {
  if (state.pages.length < 2) return toast('You need at least one page');
  const i = state.pages.indexOf(p);
  state.pages.splice(i, 1);
  state.trash.unshift({ id: uid(), type: 'page', item: p, from: { index: i }, at: Date.now() });
  if (state.activePage === p.id) state.activePage = state.pages[Math.max(0, i - 1)].id;
  commit();
  undoToast(`Page “${p.name}” moved to trash`);
}

// ---------- boards ----------
async function addBoard() {
  const v = await modal({ title: 'New board', fields: [{ name: 'title', label: 'Board name', placeholder: 'e.g. Design inspiration' }], ok: 'Create' });
  if (!v || !v.title.trim()) return;
  page().boards.push({ id: uid(), title: v.title.trim(), links: [] });
  commit();
}
async function renameBoard(b) {
  const v = await modal({ title: 'Rename board', fields: [{ name: 'title', label: 'Board name', value: b.title }], ok: 'Save' });
  if (v && v.title.trim()) { b.title = v.title.trim(); commit(); }
}
function boardMenu(e, b) {
  e.stopPropagation();
  const r = e.currentTarget.getBoundingClientRect();
  menu(r.right - 190, r.bottom + 6, [
    ['plus', 'Add link', () => addLink(b)],
    ['edit', 'Rename', () => renameBoard(b)],
    ['external', `Open all (${b.links.length})`, () => openAll(b)],
    ['move', 'Move to page…', () => moveBoardPrompt(b)],
    ['trash', 'Delete board', () => deleteBoard(b), 'danger'],
  ]);
}
function openAll(b) {
  if (!b.links.length) return;
  if (state.settings.incognito) return chrome.windows.create({ url: b.links.map((l) => l.url), incognito: true }).catch(() => toast('Allow LinkBoard in Incognito first'));
  b.links.forEach((l) => chrome.tabs.create({ url: l.url, active: false }));
}
async function moveBoardPrompt(b) {
  const others = state.pages.filter((p) => p.id !== page().id);
  if (!others.length) return toast('Create another page first');
  const v = await modal({ title: `Move “${b.title}”`, fields: [{ name: 'page', label: 'To page', type: 'select', options: others.map((p) => [p.id, p.name]) }], ok: 'Move' });
  if (v) moveBoardToPage(b.id, state.pages.find((p) => p.id === v.page));
}
function moveBoardToPage(id, target) {
  const f = findBoard(id);
  if (!f || f.page === target) return;
  f.page.boards.splice(f.index, 1);
  target.boards.push(f.board);
  commit();
  toast(`Moved “${f.board.title}” to ${target.name}`);
}
function deleteBoard(b) {
  const f = findBoard(b.id);
  f.page.boards.splice(f.index, 1);
  state.trash.unshift({ id: uid(), type: 'board', item: b, from: { pageId: f.page.id, index: f.index }, at: Date.now() });
  commit();
  undoToast(`Board “${b.title}” moved to trash`);
}

// ---------- links ----------
async function addLink(b) {
  const v = await modal({
    title: `Add link to ${b.title}`,
    fields: [{ name: 'url', label: 'URL', placeholder: 'https://…' }, { name: 'title', label: 'Title (optional)' }],
    ok: 'Add',
  });
  if (!v || !v.url.trim()) return;
  const url = normUrl(v.url);
  b.links.push({ id: uid(), title: v.title.trim() || hostOf(url), url, added: Date.now() });
  commit();
}
async function editLink(l) {
  const v = await modal({ title: 'Edit link', fields: [{ name: 'title', label: 'Title', value: l.title }, { name: 'url', label: 'URL', value: l.url }], ok: 'Save' });
  if (!v || !v.url.trim()) return;
  l.url = normUrl(v.url);
  l.title = v.title.trim() || hostOf(l.url);
  commit();
}
function deleteLinks(ids) {
  let n = 0;
  for (const id of ids) {
    const f = findLink(id);
    if (!f) continue;
    f.board.links.splice(f.index, 1);
    state.trash.unshift({ id: uid(), type: 'link', item: f.link, from: { pageId: f.page.id, boardId: f.board.id, index: f.index }, at: Date.now() });
    n++;
  }
  ids.forEach((id) => selected.delete(id));
  commit();
  undoToast(n === 1 ? 'Link moved to trash' : `${n} links moved to trash`, n);
}
function inboxOf(p) {
  let b = p.boards.find((x) => x.title === 'Inbox');
  if (!b) { b = { id: uid(), title: 'Inbox', links: [] }; p.boards.unshift(b); }
  return b;
}
function moveLinksToBoard(ids, target) {
  for (const id of ids) {
    const f = findLink(id);
    if (!f) continue;
    f.board.links.splice(f.index, 1);
    target.links.push(f.link);
  }
}
function moveLinksToPage(ids, p) {
  moveLinksToBoard(ids, p.boards[0] || inboxOf(p));
  commit();
  toast(`Moved to ${p.name}`);
}

// ---------- selection mode ----------
function toggleSelect(on = !selecting) {
  selecting = on;
  selected.clear();
  render();
}
function renderSelbar() {
  const bar = $('#selbar');
  bar.hidden = !selecting;
  if (!selecting) return;
  const n = selected.size;
  const visible = page().boards.flatMap((b) => b.links.map((l) => l.id));
  bar.replaceChildren(
    h('b', {}, `${n} selected`),
    h('button', { class: 'btn', onclick: () => { const all = visible.every((id) => selected.has(id)); visible.forEach((id) => (all ? selected.delete(id) : selected.add(id))); render(); } }, 'All'),
    h('button', { class: 'btn', disabled: !n, onclick: bulkMove, html: svg('move') + 'Move' }),
    h('button', { class: 'btn', disabled: !n, onclick: () => [...selected].forEach((id) => openUrl(findLink(id).link.url, true)), html: svg('external') + 'Open' }),
    h('button', { class: 'btn danger', disabled: !n, onclick: () => deleteLinks([...selected]), html: svg('trash') + 'Delete' }),
    h('button', { class: 'btn', onclick: () => toggleSelect(false) }, 'Done'),
  );
}
async function bulkMove() {
  const opts = state.pages.flatMap((p) => p.boards.map((b) => [b.id, `${p.name} › ${b.title}`]));
  const v = await modal({ title: `Move ${selected.size} link(s)`, fields: [{ name: 'board', label: 'To board', type: 'select', options: opts }], ok: 'Move' });
  if (!v) return;
  moveLinksToBoard([...selected], findBoard(v.board).board);
  selected.clear();
  commit();
}

// ---------- drawer ----------
let drawerView = null;
function openDrawer(view) {
  if (drawerView === view) return closeDrawer();
  drawerView = view;
  $('#drawer').classList.add('open');
  drawerViews[view]();
}
function closeDrawer() { drawerView = null; $('#drawer').classList.remove('open'); }
function drawer(title, ...content) {
  $('#drawer-title').textContent = title;
  $('#drawer-body').replaceChildren(...content);
}

const search = { q: '', scope: 'all', exact: false };
const drawerViews = {
  search(refresh) {
    if (refresh) return runSearch();
    const input = h('input', { class: 'input', placeholder: 'Search titles and URLs…', value: search.q });
    input.oninput = () => { search.q = input.value; runSearch(); };
    input.onkeydown = (e) => {
      const items = [...document.querySelectorAll('.res')];
      if (!items.length) return;
      let k = items.findIndex((x) => x.classList.contains('kb'));
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        items[k]?.classList.remove('kb');
        k = e.key === 'ArrowDown' ? (k + 1) % items.length : (k - 1 + items.length) % items.length;
        items[k].classList.add('kb'); items[k].scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'Enter') (items[k] || items[0]).click();
    };
    const chip = (key, val, label) => {
      const c = h('button', { class: 'chip' + (search[key] === val ? ' on' : '') }, label);
      c.onclick = () => { search[key] = key === 'exact' ? !search.exact : val; drawerViews.search(); };
      return c;
    };
    drawer('Search',
      input,
      h('div', { class: 'chips' }, chip('scope', 'all', 'All pages'), chip('scope', 'page', 'This page'), chip('scope', 'board', 'Board names'), chip('exact', true, 'Exact match')),
      h('div', { class: 'results', id: 'results' }),
    );
    runSearch();
    setTimeout(() => input.focus(), 50);
  },

  import() {
    drawer('Import & Export',
      h('div', { class: 'sec' },
        h('h4', {}, 'Import'),
        h('button', { class: 'btn block', html: svg('bookmark') + 'Import Chrome bookmarks', onclick: importChrome }),
        h('button', { class: 'btn block', html: svg('file') + 'Import file (.html / .txt / .json)', onclick: () => $('#file-import').click() }),
        h('p', { class: 'hint' }, 'HTML = bookmark export from any browser. TXT = one URL per line. JSON = LinkBoard backup.'),
      ),
      h('div', { class: 'sec' },
        h('h4', {}, 'Export'),
        h('button', { class: 'btn block', html: svg('upload') + 'Download backup (.json)', onclick: exportJson }),
        h('button', { class: 'btn block', html: svg('upload') + 'Export as browser bookmarks (.html)', onclick: exportHtml }),
      ),
      h('input', { type: 'file', id: 'file-import', accept: '.html,.htm,.txt,.json', hidden: true, onchange: (e) => importFile(e.target.files[0]) }),
    );
  },

  trash() {
    const list = h('div', {});
    if (!state.trash.length) list.append(h('p', { class: 'hint' }, 'Trash is empty.'));
    for (const t of state.trash) {
      const name = t.type === 'link' ? t.item.title : t.type === 'board' ? `Board · ${t.item.title}` : `Page · ${t.item.name}`;
      const sub = t.type === 'link' ? t.item.url : t.type === 'board' ? `${t.item.links.length} links` : `${t.item.boards.length} boards`;
      list.append(h('div', { class: 'res' },
        t.type === 'link' ? favicon(t.item.url) : h('span', { class: 'fav fav-letter' }, t.type[0].toUpperCase()),
        h('div', { class: 'meta' }, h('div', { class: 't' }, name), h('div', { class: 'u' }, `${sub} · ${ago(t.at)}`)),
        h('button', { class: 'icon-btn', html: svg('restore'), title: 'Restore', onclick: () => restore(t.id) }),
        h('button', { class: 'icon-btn danger', html: svg('x'), title: 'Delete forever', onclick: () => { state.trash = state.trash.filter((x) => x.id !== t.id); commit(); } }),
      ));
    }
    drawer('Trash',
      state.trash.length ? h('div', { class: 'row' },
        h('span', { class: 'hint' }, `${state.trash.length} item(s)`),
        h('button', { class: 'btn danger', onclick: async () => { if (await confirmBox('Empty trash?', 'Items will be deleted permanently.')) { state.trash = []; commit(); } } }, 'Empty trash'),
      ) : '',
      list,
    );
  },

  settings() {
    const s = state.settings;
    const sw = (c) => h('button', { class: 'sw' + (s.accent === c ? ' on' : ''), style: `background:${c}`, onclick: () => { s.accent = c; commit(); } });
    const colorIn = h('input', { type: 'color', value: s.accent, title: 'Custom color' });
    colorIn.oninput = () => { s.accent = colorIn.value; applyLook(); };
    colorIn.onchange = () => commit();
    const range = (key, min, max, step, label, fmt) => {
      const val = h('span', { class: 'hint' }, fmt(s[key]));
      const r = h('input', { type: 'range', min, max, step, value: s[key] });
      r.oninput = () => { s[key] = +r.value; val.textContent = fmt(s[key]); applyLook(); };
      r.onchange = () => save();
      return h('div', { class: 'row' }, h('span', {}, label, ' ', val), r);
    };
    const toggle = (key, label) => {
      const cb = h('input', { type: 'checkbox', checked: s[key] });
      cb.onchange = () => { s[key] = cb.checked; commit(); };
      return h('div', { class: 'row' }, h('span', {}, label), h('label', { class: 'switch' }, cb, h('span')));
    };
    drawer('Settings',
      h('div', { class: 'sec' }, h('h4', {}, 'Accent color'),
        h('div', { class: 'swatches' }, ...['#f0c27b', '#7bd3f0', '#9be39b', '#f08bb4', '#b69cff', '#ff9f68', '#ffffff'].map(sw), colorIn)),
      h('div', { class: 'sec' }, h('h4', {}, 'Wallpaper'),
        h('div', { class: 'presets' },
          ...PRESETS.map((p) => h('button', {
            class: 'preset' + (!wallpaper && s.preset === p.id ? ' on' : ''), title: p.name, style: `background-image:url("${p.thumb}")`,
            onclick: async () => { s.preset = p.id; await chrome.storage.local.remove('wallpaper'); wallpaper = null; commit(); },
          })),
          h('button', { class: 'preset preset-none' + (!wallpaper && s.preset === 'none' ? ' on' : ''), title: 'Plain gradient',
            onclick: async () => { s.preset = 'none'; await chrome.storage.local.remove('wallpaper'); wallpaper = null; commit(); } }, 'None'),
          h('button', { class: 'preset preset-none' + (wallpaper ? ' on' : ''), title: 'Upload your own', onclick: () => $('#wall-input').click() }, wallpaper ? 'Custom' : '+ Upload'),
        ),
        range('dim', 0, 0.8, 0.05, 'Darken', (v) => Math.round(v * 100) + '%'),
        range('blur', 0, 30, 1, 'Blur', (v) => v + 'px'),
      ),
      h('div', { class: 'sec' }, h('h4', {}, 'Layout & behavior'),
        range('col', 220, 480, 10, 'Board width', (v) => v + 'px'),
        toggle('newTab', 'Open links in a new tab'),
        toggle('incognito', 'Open links in Incognito'),
      ),
      h('div', { class: 'sec' }, h('h4', {}, 'Shortcuts'),
        h('div', { class: 'row' }, h('span', {}, 'Quick save current page'), h('kbd', {}, 'Ctrl+Shift+Y')),
        h('div', { class: 'row' }, h('span', {}, 'Search'), h('kbd', {}, '/')),
        h('div', { class: 'row' }, h('span', {}, 'Close panel / cancel'), h('kbd', {}, 'Esc')),
        h('button', { class: 'btn', onclick: () => chrome.tabs.create({ url: 'chrome://extensions/shortcuts' }) }, 'Change shortcut'),
        h('p', { class: 'hint' }, 'Quick save, the toolbar icon, and the right-click menu all save into an “Inbox” board on your current page.'),
      ),
    );
  },
};

function runSearch() {
  const box = $('#results');
  if (!box) return;
  box.replaceChildren();
  const q = search.q.trim();
  if (!q) return box.append(h('p', { class: 'hint' }, 'Type to search. ↑↓ to navigate, Enter to open.'));
  const ql = q.toLowerCase();
  const words = ql.split(/\s+/);
  const match = (text) => {
    text = (text || '').toLowerCase();
    return search.exact ? text.includes(ql) : words.every((w) => text.includes(w));
  };
  const pages = search.scope === 'page' ? [page()] : state.pages;
  const out = [];
  for (const p of pages) for (const b of p.boards) {
    if (search.scope === 'board') { if (match(b.title)) out.push({ p, b }); continue; }
    for (const l of b.links) if (match(l.title + ' ' + l.url)) out.push({ p, b, l });
  }
  if (!out.length) return box.append(h('p', { class: 'hint' }, 'No matches.'));
  const mark = (text) => {
    const span = h('span');
    const terms = search.exact ? [ql] : words;
    const re = new RegExp('(' + terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')', 'ig');
    text.split(re).forEach((part, i) => span.append(i % 2 ? h('mark', {}, part) : part));
    return span;
  };
  for (const r of out.slice(0, 200)) {
    const row = r.l
      ? h('div', { class: 'res' }, favicon(r.l.url),
          h('div', { class: 'meta' }, h('div', { class: 't' }, mark(r.l.title)), h('div', { class: 'u' }, `${r.p.name} › ${r.b.title} · `, mark(hostOf(r.l.url)))),
          h('button', { class: 'icon-btn', html: svg('move'), title: 'Show on board', onclick: (e) => { e.stopPropagation(); reveal(r.p, r.l.id); } }))
      : h('div', { class: 'res' }, h('span', { class: 'fav fav-letter' }, 'B'),
          h('div', { class: 'meta' }, h('div', { class: 't' }, mark(r.b.title)), h('div', { class: 'u' }, `${r.p.name} · ${r.b.links.length} links`)));
    row.onclick = (e) => (r.l ? openUrl(r.l.url, e.ctrlKey || e.metaKey) : reveal(r.p, null, r.b.id));
    box.append(row);
  }
}
function reveal(p, linkId, boardId) {
  state.activePage = p.id;
  commit();
  closeDrawer();
  requestAnimationFrame(() => {
    const el = document.querySelector(linkId ? `.link[data-id="${linkId}"]` : `.board[data-id="${boardId}"]`);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.classList.add('flash');
    setTimeout(() => el.classList.remove('flash'), 1700);
  });
}

// ---------- trash ----------
const ago = (t) => {
  const s = (Date.now() - t) / 1000;
  if (s < 60) return 'just now';
  if (s < 3600) return Math.floor(s / 60) + 'm ago';
  if (s < 86400) return Math.floor(s / 3600) + 'h ago';
  return Math.floor(s / 86400) + 'd ago';
};
function restore(trashId, silent) {
  const i = state.trash.findIndex((x) => x.id === trashId);
  if (i < 0) return;
  const [t] = state.trash.splice(i, 1);
  if (t.type === 'page') state.pages.splice(Math.min(t.from.index, state.pages.length), 0, t.item);
  else if (t.type === 'board') {
    const p = state.pages.find((x) => x.id === t.from.pageId) || page();
    p.boards.splice(Math.min(t.from.index, p.boards.length), 0, t.item);
  } else {
    const fb = findBoard(t.from.boardId);
    const b = fb ? fb.board : inboxOf(page());
    b.links.splice(Math.min(t.from.index, b.links.length), 0, t.item);
  }
  if (!silent) { commit(); toast('Restored'); }
}

// ---------- import / export ----------
async function importChrome() {
  const tree = await chrome.bookmarks.getTree();
  const boards = [];
  const walk = (node, path) => {
    const links = (node.children || []).filter((c) => c.url && /^(https?|ftp|file):/.test(c.url));
    if (links.length) boards.push({ id: uid(), title: path.join(' / ') || 'Bookmarks', links: links.map((c) => ({ id: uid(), title: c.title || hostOf(c.url), url: c.url, added: c.dateAdded || Date.now() })) });
    for (const c of node.children || []) if (!c.url) walk(c, c.title ? [...path, c.title] : path);
  };
  walk(tree[0], []);
  if (!boards.length) return toast('No Chrome bookmarks found');
  // drop the generic root names ("Bookmarks bar / X" → "X")
  boards.forEach((b) => { const parts = b.title.split(' / '); if (parts.length > 1) b.title = parts.slice(1).join(' / '); });
  addImportedPage('Chrome bookmarks', boards);
}
function addImportedPage(name, boards) {
  const p = { id: uid(), name, boards };
  state.pages.push(p);
  state.activePage = p.id;
  commit();
  const n = boards.reduce((a, b) => a + b.links.length, 0);
  toast(`Imported ${n} links into ${boards.length} board(s)`);
}
async function importFile(file) {
  if (!file) return;
  const text = await file.text();
  const name = file.name.toLowerCase();
  try {
    if (name.endsWith('.json')) {
      const data = JSON.parse(text);
      if (!Array.isArray(data.pages)) throw new Error('Not a LinkBoard backup');
      if (!(await confirmBox('Restore backup?', 'This replaces all your current pages and boards.'))) return;
      state = { ...data, settings: { ...DEFAULT_SETTINGS, ...(data.settings || {}) }, trash: data.trash || [] };
      if (!state.pages.some((p) => p.id === state.activePage)) state.activePage = state.pages[0].id;
      commit();
      return toast('Backup restored');
    }
    if (name.endsWith('.txt')) {
      const urls = text.split(/\r?\n/).map((s) => s.trim()).filter((s) => /^(https?|ftp):\/\//i.test(s));
      if (!urls.length) return toast('No URLs found in file');
      return addImportedPage(file.name.replace(/\.txt$/i, ''), [{ id: uid(), title: 'Imported', links: urls.map((u) => ({ id: uid(), title: hostOf(u), url: u, added: Date.now() })) }]);
    }
    // Netscape bookmark HTML: walk DL/DT structure
    const doc = new DOMParser().parseFromString(text, 'text/html');
    const boards = [];
    const map = new Map();
    for (const a of doc.querySelectorAll('a[href]')) {
      const url = a.getAttribute('href');
      if (!/^(https?|ftp|file):/i.test(url)) continue;
      const folders = [];
      let dl = a.closest('dl');
      while (dl) {
        const dt = dl.previousElementSibling?.matches('h3') ? dl.previousElementSibling : dl.parentElement?.querySelector(':scope > h3');
        if (dt) folders.unshift(dt.textContent.trim());
        dl = dl.parentElement?.closest('dl');
      }
      const key = folders.slice(-2).join(' / ') || 'Imported';
      if (!map.has(key)) { const b = { id: uid(), title: key, links: [] }; map.set(key, b); boards.push(b); }
      map.get(key).links.push({ id: uid(), title: a.textContent.trim() || hostOf(url), url, added: Date.now() });
    }
    if (!boards.length) return toast('No bookmarks found in file');
    addImportedPage(file.name.replace(/\.html?$/i, ''), boards);
  } catch (err) {
    toast('Import failed: ' + err.message);
  } finally {
    const fi = $('#file-import'); if (fi) fi.value = '';
  }
}
function download(name, text, type) {
  const a = h('a', { href: URL.createObjectURL(new Blob([text], { type })), download: name });
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
const stamp = () => new Date().toISOString().slice(0, 10);
function exportJson() { download(`linkboard-backup-${stamp()}.json`, JSON.stringify(state, null, 2), 'application/json'); }
function exportHtml() {
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  let out = '<!DOCTYPE NETSCAPE-Bookmark-file-1>\n<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">\n<TITLE>Bookmarks</TITLE>\n<H1>LinkBoard</H1>\n<DL><p>\n';
  for (const p of state.pages) {
    out += `  <DT><H3>${esc(p.name)}</H3>\n  <DL><p>\n`;
    for (const b of p.boards) {
      out += `    <DT><H3>${esc(b.title)}</H3>\n    <DL><p>\n`;
      for (const l of b.links) out += `      <DT><A HREF="${esc(l.url)}" ADD_DATE="${Math.floor((l.added || Date.now()) / 1000)}">${esc(l.title)}</A>\n`;
      out += '    </DL><p>\n';
    }
    out += '  </DL><p>\n';
  }
  download(`linkboard-bookmarks-${stamp()}.html`, out + '</DL><p>\n', 'text/html');
}

// ---------- wallpaper ----------
$('#wall-input').onchange = async (e) => {
  const file = e.target.files[0];
  e.target.value = '';
  if (!file) return;
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, 2560 / bmp.width);
  const c = h('canvas', { width: Math.round(bmp.width * scale), height: Math.round(bmp.height * scale) });
  c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
  await chrome.storage.local.set({ wallpaper: c.toDataURL('image/jpeg', 0.88) });
  toast('Wallpaper updated');
};

// ---------- UI primitives ----------
let toastTimer;
function toast(msg, action) {
  const t = $('#toast');
  t.replaceChildren(h('span', {}, msg));
  if (action) t.append(h('button', { onclick: () => { action.fn(); t.hidden = true; } }, action.label));
  t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (t.hidden = true), action ? 5000 : 2600);
}
function undoToast(msg, count = 1) {
  const ids = state.trash.slice(0, count).map((t) => t.id);
  toast(msg, { label: 'Undo', fn: () => { ids.reverse().forEach((id) => restore(id, true)); commit(); } });
}

function modal({ title, fields = [], ok = 'OK', danger = false, text }) {
  return new Promise((resolve) => {
    const inputs = {};
    const close = (val) => { ov.remove(); resolve(val); };
    const form = h('form', { class: 'modal' }, h('h3', {}, title), text ? h('p', {}, text) : '');
    for (const f of fields) {
      const id = 'f-' + f.name;
      const input = f.type === 'select'
        ? h('select', { class: 'input', id }, ...f.options.map(([v, l]) => h('option', { value: v }, l)))
        : h('input', { class: 'input', id, value: f.value || '', placeholder: f.placeholder || '', autocomplete: 'off' });
      inputs[f.name] = input;
      form.append(h('label', { for: id }, f.label), input);
    }
    form.append(h('div', { class: 'actions' },
      h('button', { type: 'button', class: 'btn', onclick: () => close(null) }, 'Cancel'),
      h('button', { type: 'submit', class: 'btn ' + (danger ? 'danger' : 'primary') }, ok)));
    form.onsubmit = (e) => { e.preventDefault(); close(Object.fromEntries(Object.entries(inputs).map(([k, v]) => [k, v.value]))); };
    const ov = h('div', { class: 'overlay' }, form);
    ov.onmousedown = (e) => { if (e.target === ov) close(null); };
    ov.onkeydown = (e) => { if (e.key === 'Escape') { e.stopPropagation(); close(null); } };
    $('#modal-root').append(ov);
    const first = form.querySelector('input,select,button[type=submit]');
    setTimeout(() => { first.focus(); first.select?.(); }, 20);
  });
}
const confirmBox = (title, text) => modal({ title, text, ok: 'Confirm', danger: true }).then((v) => !!v);

function menu(x, y, items) {
  document.querySelector('.menu')?.remove();
  const m = h('div', { class: 'menu' }, ...items.filter(Boolean).map(([icon, label, fn, cls]) =>
    h('button', { class: cls || '', html: svg(icon) + `<span></span>`, onclick: () => { m.remove(); fn(); } })));
  [...m.children].forEach((b, i) => (b.querySelector('span').textContent = items.filter(Boolean)[i][1]));
  document.body.append(m);
  const r = m.getBoundingClientRect();
  m.style.left = Math.max(8, Math.min(x, innerWidth - r.width - 8)) + 'px';
  m.style.top = Math.max(8, Math.min(y, innerHeight - r.height - 8)) + 'px';
  setTimeout(() => document.addEventListener('mousedown', function off(e) {
    if (!m.contains(e.target)) { m.remove(); document.removeEventListener('mousedown', off); }
  }), 0);
}

// ---------- wiring ----------
$('#btn-wallpaper').innerHTML = svg('image');
$('#btn-search').innerHTML = svg('search');
$('#btn-import').innerHTML = svg('download');
$('#btn-trash').innerHTML = svg('trash');
$('#btn-settings').innerHTML = svg('gear');
$('#drawer-close').innerHTML = svg('x');

$('#btn-wallpaper').onclick = () => $('#wall-input').click();
$('#btn-search').onclick = () => openDrawer('search');
$('#btn-import').onclick = () => openDrawer('import');
$('#btn-trash').onclick = () => openDrawer('trash');
$('#btn-settings').onclick = () => openDrawer('settings');
$('#drawer-close').onclick = closeDrawer;
$('#btn-incognito').onclick = () => { state.settings.incognito = !state.settings.incognito; commit(); toast(state.settings.incognito ? 'Links will open in Incognito' : 'Incognito off'); };
$('#btn-privacy').onclick = () => { state.settings.privacy = !state.settings.privacy; commit(); };
$('#btn-select').onclick = () => toggleSelect();

document.addEventListener('keydown', (e) => {
  if ($('.overlay')) return;
  const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName);
  if (e.key === '/' && !typing) { e.preventDefault(); drawerView === 'search' ? $('#drawer-body input')?.focus() : openDrawer('search'); }
  else if (e.key === 'Escape') {
    if (document.querySelector('.menu')) document.querySelector('.menu').remove();
    else if (drawerView) closeDrawer();
    else if (selecting) toggleSelect(false);
  }
});

load().then(render);
