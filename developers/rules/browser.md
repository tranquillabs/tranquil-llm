<!-- For agents working on Tranquil's repos. Never shipped. -->

# The browser: pages, IPC and webviews

Tranquil's browser tabs are Electron `<webview>` guests owned by tranquil-browser
(`lib/tranquil-browser-view.js`, preload `resources/bp-client.js`). Every website loads with that
preload, so it is a security boundary first.

## The page bridge

Every page sees `window.electron` from `bp-client.js`. It exposes only `sendToHost`/`receive`,
restricted to fixed channel sets (`tranquil:rpc`, history changes), plus `tabFocus()` and
`suggest()`. **Never add a method that takes a channel name from the page.** The webview runs with
`webpreferences: "contextIsolation=yes, sandbox=yes"`; page permission requests are denied by
default (`src/main-process/page-permissions.js`).

**Why:** until 2026-10-11 the bridge passed `send`/`sendSync`/`invoke`/`receive` through on any
channel, so any website could reach every `ipcMain` handler (quit, crash a window, clear cookies,
open local paths).

- **A new browser channel** goes in `CHANNELS` in `tranquil-browser/lib/ipc.js`, with a JSDoc
  payload type, and the constant is used on every side (preload, host renderer, `cz-init.js` and
  `har.js` in the main process). Page-to-window messages the main process only relays go in
  `RELAYED`, handled by one loop in `cz-init.js`.
- **A new page capability** is a named method on the bridge, never a channel.
- **Trust:** only `file://` pages under registered roots are trusted (they get the tranquil-rpc
  runtime and capabilities); all `http(s)://` and stray `file://` pages get none.

## Running code in a page

- From the host, use `callInPage(webview, fn, ...args)` (tranquil-browser `lib/utils.js`,
  tranquil-automations `lib/call-in-page.js`). Never concatenate values into a code string; for
  navigation use `webview.loadURL`. `lint:security` (`no-string-page-code`) enforces this.
- `executeJavaScript` runs in the page's persistent context: a top-level `const`/`let` from one call
  is still declared on the next. Wrap snippets in a block or an IIFE.
- To act on each page load, observe the active item and listen for `did-stop-loading` on its
  webview (`item?.view?.htmlv?.[0]`), keeping a `WeakSet` of instrumented webviews, wrapping webview
  calls in try/catch (they throw before `dom-ready`), and running once immediately for tabs already
  loaded. Guard injected code against double runs.

## Webview facts that cost time

- **Sync webview calls block the host.** `webview.getTitle()`/`getURL()` are synchronous IPC; one
  call blocked the window for 1.5 to 6 seconds on a heavy page. Keep them off hot paths (render
  loops, frequent events): use the model's URL and titles cached from `page-title-updated`. Open
  diagnosis (parked, 2026-10-08): `labelFor` in tranquil-automations `vertical-tabs-view.js` and the
  favicon handler in tranquil-browser; also a ~3 MB jStorage blob rewritten on every `set()`, and a
  new `<style>` per favicon event that is never removed.
- **Popups:** a `<webview>` without `allowpopups` blocks `target=_blank` and `window.open` before the
  main process sees them, and Electron 30 dropped the webview `new-window` event. Link routing is
  therefore done in the preload with a capture-phase `click` listener (`event.target.closest('a')`,
  not `document.activeElement`; SPAs stop propagation in the bubble phase). Plain click on a normal
  link navigates the tab; plain click on `target=_blank` opens a focused new tab; cmd/ctrl-click
  opens a background tab at the end of the source tab's run. The renderer side is
  `lib/utils.js` `open-link-in-new-tab`.
- **DevTools for a guest can't be embedded** in a pane (`setDevToolsWebContents` never attaches for
  an OOPIF webview; Electron issues 14095, 15874). Only `openDevTools({ mode: 'detach' })` works.
- **Over CDP** (puppeteer or otherwise), Electron can attach to existing targets but not create
  them: `Target.createTarget` is unsupported. Make a background page with an off-screen `<webview>`
  in the renderer and attach to its target.
- **The start page** `tranquil-browser://blank` renders `resources/home.html`. Don't fake its URL
  with `history.pushState` (a cross-origin entry breaks Back); the host maps the document's URL to
  the friendly one. A restored blank tab resolves through `getTranquilBrowserUrl`, which builds the
  `file://` URL from `__dirname`.
- **Editing:** `bp-client.js` is a preload, so reload the tab (or restart for key-forwarding
  changes); renderer code in `lib/` needs Window: Reload; `cz-init.js` is the main process and needs
  a full restart.

Related: [keyboard.md](keyboard.md), [security-first.md](security-first.md).
