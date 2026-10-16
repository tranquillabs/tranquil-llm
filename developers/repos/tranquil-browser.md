<!-- For agents working on Tranquil's repos. Never shipped. -->

# tranquil-browser

The Chromium browser tabs: `<webview>` pane items with a URL bar, history, history-ranked URL
suggestions, find in page, `.url` file support, and the start page. Read
[rules/browser.md](../rules/browser.md) and [rules/keyboard.md](../rules/keyboard.md) first: every
website runs this package's preload.

## Layout

- `lib/tranquil-browser.js`: package main; the URL opener (`addOpener`, declines with `false`),
  commands, the window-level guest key listener (`handleGlobalGuestKey`).
- `lib/tranquil-browser-model.js` / `tranquil-browser-view.js`: the pane item (`HTMLEditor`,
  `getAllowedLocations`, per-instance `allowedLocations`/`defaultLocation`/`hideURLBar`) and its
  view (`keyHandler`, URL display).
- `lib/browser-commands.js`: the command table (`SPECS`, `keyToCommandId`, `activeBrowser`).
- `lib/split-chord.js`: cmd-k + arrow.
- `lib/ipc.js`: typed channels (`CHANNELS`, `RELAYED`), shared with the main process.
- `lib/utils.js`: webview helpers, `callInPage`, renderer IPC handlers.
- `lib/history-suggestions.js`: URL-bar suggestions (ADR-0021).
- `lib/browser-find-item.js`: find in page (ADR-0009), a pane item at `tranquil-find://find`.
- `resources/bp-client.js`: the webview preload (the page bridge); `resources/home.html`: the
  start page.

## Facts

- **jQuery UI 1.10 autocomplete** (URL suggestions): history `date` is a locale string, so score by
  day keys only; every `res()` item must be a `{label, value}` object; the widget instance is
  `jQ(input).data("ui-autocomplete")` with the widget's own jQuery (space-pen `$` returns
  undefined); menu rows must be `<li><a>`. The dropdown attaches to `<body>`, outside theme scope,
  so its styles are global and color-free.
- **Find in page:** Pulsar's find-and-replace can't search a webview, so find uses
  `webview.findInPage()` (`findNext: true` always). Stale highlights are cleared before a tab switch
  by a capture-phase tab-bar `mousedown`, since there is no will-change-active-item event.
- **User-Agent** (ADR-0019): applied in three layers, the `<webview useragent>` attribute, a config
  observer updating open tabs, and a main-process `onBeforeSendHeaders` rewrite in `cz-init.js` for
  subresources. Default is the stock Chrome UA derived from the live one.
- **Sessions:** each window's webviews use `persist:tb-window-<windowSessionId>` (ADR-0005), so the
  same site can be signed in differently per window. A HAR replay's explicit partition wins.
- **Storage:** history and favicons live in jStorage (`bp.history.<windowSessionId>`,
  `bp.favIcon`), shared across windows. Every `set()` rewrites the whole blob; keep writes rare.
- Toolbar styling lives in this package for geometry and in the business themes for color.
