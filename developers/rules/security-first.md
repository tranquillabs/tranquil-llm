<!-- For agents working on Tranquil's repos. Never shipped. -->

# Security first

Security is first-level importance. **Nothing may get past the Deno sandbox, and nothing may hold
a permission that was not explicitly specified.**

**Why:** an audit (2026-10-11) found two blanket grants nobody had asked for: `window.electron` in
every browser page passed any IPC channel through to the main process, and the browser view granted
every page permission request (camera, microphone, location). Convenience grants are how the
sandbox gets bypassed.

## How to apply

- **Default-deny everywhere:** Electron permission, device and display-media handlers; webview
  preferences; IPC bridges; RPC capabilities; Deno flags (`--allow-*` scoped to explicit paths and
  hosts, never bare, never `-A`).
- **A grant traces to an explicit declaration:** a script's permission header, a user setting, or a
  user prompt. Never to convenience.
- **Say when something is advisory.** The SDK's grant checks are advisory while scripts can reach
  the raw CDP port (ADR-0028, a release gate). Name gaps like that plainly and treat closing them
  as a priority, not a follow-up.
- **Look for blanket grants first** when auditing or adding code: `allow()`, `--allow-read` with no
  list, pass-through channels, `*` origins, code built from strings and run in a page.
- **Run the lint after any change to owned code:**
  `cd ../tranquil-test-suite && deno task lint:security` (see
  [tools/lint-security.md](../tools/lint-security.md)). When a new kind of blanket grant turns up,
  add a rule for it. Exceptions only as
  `// deno-lint-ignore tranquil-security/<rule> -- reason`.

## Known gaps

- **The CDP port (ADR-0028, proposed).** `src/main-process/start.js` opens
  `remote-debugging-port` (9222) in every build. Its target list includes Tranquil's own
  Node-enabled windows, and the runner grants the port to any script with a browser grant, so a
  `tabs`-only script can run Node.js in the main window. The decision: no port unless
  `TRANQUIL_CDP_PORT` is set and the app is unpackaged; the host attaches `webContents.debugger`
  per tab and forwards only each grant's operations. **No release ships until the port is closed
  by default.** When implementing, add a `lint:security` rule: `remote-debugging-port` only behind
  `!app.isPackaged`.

Related: [browser.md](browser.md) (IPC channels, code in pages), [automations.md](automations.md).
