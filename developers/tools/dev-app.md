<!-- For agents working on Tranquil's repos. Never shipped. -->

# Running the app in development

Everything here runs in tranquil-client. First-time setup is in
[repos/tranquil-client.md](../repos/tranquil-client.md#dev-setup).

## Node and Yarn

Always `source ~/.nvm/nvm.sh && nvm use` before any `node`, `yarn` or `npm` command in
tranquil-client. The version is in `.nvmrc` (20.16.0); the system default Node gives silent
failures or corepack errors. A repo without `.nvmrc` (atom-pdf-view) needs `nvm use 20.16.0`
explicitly.

## Start, verify, stop

- **`yarn start`** runs `scripts/dev.js`: it loads `.env` (see `.env-example`) and spawns Electron
  with `NODE_PATH` and `ATOM_RESOURCE_PATH`. It strips `ELECTRON_RUN_AS_NODE` from the child's
  environment (an editor's extension host often sets it, which makes Electron run as plain Node and
  exit), forwards extra arguments to Electron, and passes SIGINT/SIGTERM to the child, so stopping
  the wrapper reaps the whole app.
- **`yarn verify`** (`scripts/verify.js`) launches an isolated instance: a throwaway `ATOM_HOME`
  (config copied, dev packages linked, no saved session), its own `--user-data-dir`, and
  `TRANQUIL_VERIFY=1` so it opens tranquil-test-suite as the project instead of tranquil-client
  (`src/main-process/atom-application.js` `openPaths` drops the resource path only under that
  variable). **Always use a throwaway `ATOM_HOME` for anything automated**: early launches against
  the real `~/.tranquil` overwrote its saved windows.
- **After `yarn install` at the root**, native modules can be built for the wrong ABI
  (`better-sqlite3` shows a `NODE_MODULE_VERSION` mismatch and a blank window). Run `yarn build`
  (`electron-rebuild`).

## Reload after a package edit

Owned-package code in `lib/`/`src/` is loaded per window at activation. A window opened before an
edit keeps the old code, so the same script can behave differently in two windows. Reload each
window being tested (⌃⌥⌘L, Window: Reload). Reload is a full renderer reset.

- **Spot stale code before theorising:** compare the window's load time
  (`new Date(performance.timeOrigin)` in its console) with the file's mtime
  (`stat -f %Sm <file>`). "Identical code, different behavior" is the signature.
- **Restored state is not stale code.** Reload restores the saved tabs and panes. If a bug broke
  the layout and a reload saved it, every later reload restores the broken snapshot however often
  the code is fixed. Reproduce in a fresh window (Window: New Window), which has no session to
  restore, before concluding a fix didn't take.
- **What needs what:** package `lib/` code and `package.json` → Window: Reload; a webview preload
  → reload the tab (key-forwarding changes: full restart); main-process code (`src/main-process/`,
  `cz-init.js`) and menus → full app restart.

## Reading the app's output

`yarn start` writes to a pipe, not a file; there is nothing to tail.

- **Recover renderer console history over CDP.** Chromium replays each renderer's console buffer to
  a newly attached inspector: connect to `:9222`, list `/json/list`, and send `Runtime.enable` and
  `Log.enable` on each page and webview target. Entries carry epoch timestamps, so the dump can be
  sorted into a timeline. Use a raw WebSocket (or the test suite's `Cdp` client), detach cleanly,
  and don't hold sessions open for long: a watcher attached for 42 minutes and then killed
  abruptly is the leading confound in an unexplained main-process crash.
- **The terminal is filtered.** `scripts/dev.js` `keepConsoleRecord()` is an allowlist:
  `[tranquil-*]`-tagged lines always pass; everything else must come from an absolute path outside
  `node_modules/` or localhost. A quiet terminal does not mean a quiet app. The function is pure and
  can be evaluated straight out of `scripts/dev.js`.
- **Main-process output never appears over CDP.** Stall-watchdog lines (`[tranquil] main-process
  stall`, `renderer unresponsive`, suspend/resume) go to stderr only. The watchdog reports after a
  stall clears, so a stall that ends in a crash never reports.

## Crashes

- **Silent module crash:** if an IPC handler or feature does nothing, check the top of the file for
  a `require()` of something not installed. A `MODULE_NOT_FOUND` at load kills the whole file with
  no obvious error (it once disabled every handler in `cz-init.js`).
- **Main-process crash:** run `yarn start --crashdump` to capture the next one. It writes a
  Crashpad minidump with crash keys to `~/.tranquil/crashdumps` (off by default on macOS because it
  suppresses the native report, `src/main-process/start.js`). Electron's symbols are stripped, so
  names in a native crash report (fonts, `std::process::id`) are the nearest exported symbol and
  mean nothing. Open, parked: a use-after-free (`0xefefefefefefefef`) on `CrBrowserMain`,
  2026-09-03, not reproduced; first establish whether it recurs with no CDP client attached.

## CDP clients

Prefer the test suite's Deno client ([test-suite.md](test-suite.md)). If puppeteer-core is used
against Electron, connect with `browserURL: 'http://localhost:9222'` (not a bare `ws://` URL), and
remember `newPage()` is unsupported (see [rules/browser.md](../rules/browser.md)). Never drive the
live app being used; see [rules/working-together.md](../rules/working-together.md).
