# LinkBoard

A visual, drag-and-drop bookmark manager that replaces Chrome's new tab page. Frosted-glass boards over a wallpaper, organized into pages. Everything is stored locally in your browser — no account, no server.

![LinkBoard screenshot](screenshot.png)

## Features

- **Pages & boards** — group links by project or topic; rename with a double-click
- **Drag & drop** — reorder links and boards, move links between boards, drop a link on a page tab to move it there, or drag a URL straight from the address bar
- **Quick save** — `Ctrl+Shift+Y` (`Cmd+Shift+Y` on macOS), the toolbar icon, or the right-click menu saves the page into an *Inbox* board
- **Search** — press `/`; filter by all pages, current page, or board names, with exact-match mode
- **Import / export** — Chrome bookmarks, browser bookmark `.html` files, `.txt` link lists, JSON backups
- **Bulk select** — move, open, or delete many links at once
- **Trash** — deleted links, boards, and pages can be restored (plus instant Undo)
- **Privacy blur** and **Incognito mode** for opening links privately
- **Customization** — built-in wallpapers or your own, darken/blur controls, accent color, board width

## Install

### Chrome / Chromium / Brave / Edge

1. Download or clone this repo.
2. Open `chrome://extensions` and turn on **Developer mode**.
3. Click **Load unpacked** and choose this folder.
4. Open a new tab. If Chrome asks "Change back to Google?", choose **Keep it**.

> Only one extension can replace the new tab page, so disable any other new-tab extension.

### Firefox (142+)

- **Quick test:** `about:debugging` → **This Firefox** → **Load Temporary Add-on** → pick `manifest.json`. Removed when Firefox restarts.
- **Permanent:** zip the folder contents and upload to [addons.mozilla.org](https://addons.mozilla.org/developers/) as **Unlisted** — Mozilla signs it for free and you get an installable `.xpi`.
- **Developer Edition / Nightly:** set `xpinstall.signatures.required` to `false` in `about:config` to install it unsigned.

## Notes

- Incognito opening requires **Allow in Incognito** (Chrome) or **Run in Private Windows** (Firefox).
- If `Ctrl+Shift+Y` is taken, change it at `chrome://extensions/shortcuts` (Chrome) or `about:addons` → ⚙ → **Manage Extension Shortcuts** (Firefox). On Firefox for Linux, `Ctrl+Shift+Y` is also Firefox's own Downloads shortcut, so you may want to pick another.
- Site logos load from Google's and DuckDuckGo's favicon services, falling back to Chrome's favicon cache in Chrome.

## License

MIT
