<!-- For agents working on Tranquil's repos. Never shipped. -->

# Keyboard shortcuts and focus

Every shortcut follows **ADR-0018 (browser focus and keyboard routing)**. A focused `<webview>`
guest swallows keystrokes before Pulsar's keymap sees them, so a keymap-only binding silently dies
whenever a browser tab has focus.

## Two delivery paths, one command

1. **Host focus:** the normal keymap binding at `atom-workspace` scope, to a command. A binding
   scoped only to `.tranquil-browser` is not enough: it matches only when host DOM focus is inside
   the panel.
2. **Guest focus:** depends on the command.
   - **Browser commands** (act on the active browser) go in the `SPECS` table and `keyToCommandId()`
     in `tranquil-browser/lib/browser-commands.js`. They resolve the browser via `activeBrowser()`
     and call `event.abortKeyBinding()` on non-browser items, so the key falls through to the
     normal editor binding (how `tranquil-browser:find` coexists with find-and-replace).
   - **Non-browser global commands** (close all tabs, Ctrl+Tab center cycling, the command palette)
     get a branch in `handleGlobalGuestKey()` in `tranquil-browser/lib/tranquil-browser.js`, the one
     window-level listener that runs before the active-item guard. Dispatch the owning package's
     command id by string.

Rules that go with it:

- Match on `evt.code` (`'KeyW'`), not `evt.key`: macOS turns `evt.key` into a dead character while
  Option is held.
- If a menu item carries the accelerator (⌘W, `core:close`), don't also handle it in
  `handleGlobalGuestKey`, or it fires twice.
- Test with the page focused, the pane focused, and a non-browser tab active.
- **Ctrl+Tab is the canary.** It is the only navigation shortcut with no menu accelerator, so
  anything that swallows a keydown before the keymap shows up first as "Ctrl+Tab broke".

## Guest key forwarding

Guest keystrokes reach the host over IPC, not as DOM events. `bp-client.js` destructures specific
fields from the keydown and forwards only those; any field not listed is `undefined` in the
handler, so a guard like `!evt.shiftKey` silently always passes. Add the field to the forward list
first. Preload changes need a full restart.

## Split chord (cmd-k, then an arrow)

`tranquil-browser/lib/split-chord.js` is the single owner. There are still two inputs, and they must
not be collapsed:

- host focus: a capture-phase `keydown` listener registered in `activate()`, which splits via
  `paneForItem(getActivePaneItem())` and stops the arrow key from also reaching Pulsar's binding;
- guest focus: the forwarded key events.

Always find the pane with `paneForItem(item)`; `getActivePane()` is unreliable while focus is
moving. If splits break, find out which path fails before touching code.

## Never register an OS-wide shortcut

Don't use Electron's `globalShortcut`. It claims a key for the whole operating system, before any
window, keymap or menu sees it, so it breaks every binding on the same key in Tranquil and takes the
key from every other app while it is registered.

**Why:** browser zoom was once four `globalShortcut`s (⌘=, ⌘-, numpad + and -) registered while a
browser window had focus. They pre-empted Pulsar's `window:increase/decrease-font-size` on the same
keys, so the editor font size could not change in any window that had opened a browser tab, and the
keys were lost if a window closed without a blur.

**How to apply:** when a browser tab should answer a key Pulsar already binds, handle Pulsar's
command on the browser's own element and stop it there. Zoom is the worked example:
`window:increase-font-size`, `decrease` and `reset` are registered on `.tranquil-browser`
(`tranquil-browser/lib/tranquil-browser.js`), so they zoom the page when dispatched inside a tab
(keymap from the URL bar, menu accelerator from the page) and reach core everywhere else. No guest
key mapping is needed when the menu item carries the accelerator. Smoke suite:
`smoke/suites/browser-zoom.ts`.

## Two silent failures

- **Menu accelerators are global.** An `accelerator:` on an app-menu item (`menus/darwin.cson`)
  fires in the main process regardless of focus: `Shift+A` on "New Folder" once opened a dialog
  while typing in an editor. When a key fires a command whose scope doesn't match the focused
  element, grep `menus/` for `accelerator:` before reading keymaps. Never give a bare or shift-only
  letter an accelerator. Menu changes need a full restart.
- **A duplicate selector in one keymap file** drops the earlier block: JSON keeps only the last
  occurrence of a key, with no error (it once silently removed ⌘⇧A and ⌘T). When a binding does
  nothing, grep the keymap for its selector. CSON has the same hazard.

Related: [browser.md](browser.md), [pulsar.md](pulsar.md).
