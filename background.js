// LinkBoard service worker: quick save (shortcut, toolbar click, context menu)
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({ id: 'lb-page', title: 'Save page to LinkBoard', contexts: ['page'] });
    chrome.contextMenus.create({ id: 'lb-link', title: 'Save link to LinkBoard', contexts: ['link'] });
  });
});

chrome.commands.onCommand.addListener(async (cmd) => {
  if (cmd !== 'quick-save') return;
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab) saveLink(tab.url, tab.title, tab.id);
});

chrome.action.onClicked.addListener((tab) => saveLink(tab.url, tab.title, tab.id));

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'lb-link') saveLink(info.linkUrl, info.selectionText || '', tab && tab.id);
  else saveLink(info.pageUrl, tab ? tab.title : '', tab && tab.id);
});

function badge(text, color, tabId) {
  const o = tabId ? { tabId } : {};
  chrome.action.setBadgeBackgroundColor({ color, ...o });
  chrome.action.setBadgeText({ text, ...o });
  setTimeout(() => chrome.action.setBadgeText({ text: '', ...o }), 1600);
}

async function saveLink(url, title, tabId) {
  if (!url || /^(chrome|edge|about|chrome-extension|devtools):/i.test(url)) {
    badge('!', '#d9534f', tabId);
    return;
  }
  const { state: s } = await chrome.storage.local.get('state');
  const state = s || { pages: [{ id: uid(), name: 'Home', boards: [] }], trash: [], settings: {} };
  const page = state.pages.find((p) => p.id === state.activePage) || state.pages[0];
  let inbox = page.boards.find((b) => b.title === 'Inbox');
  if (!inbox) {
    inbox = { id: uid(), title: 'Inbox', links: [] };
    page.boards.unshift(inbox);
  }
  if (inbox.links.some((l) => l.url === url)) {
    badge('=', '#888888', tabId);
    return;
  }
  let host = url;
  try { host = new URL(url).hostname.replace(/^www\./, ''); } catch {}
  inbox.links.unshift({ id: uid(), title: (title || '').trim() || host, url, added: Date.now() });
  state._rev = uid();
  await chrome.storage.local.set({ state });
  badge('✓', '#2e9d6a', tabId);
}
