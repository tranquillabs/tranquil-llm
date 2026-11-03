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

## No dependency without asking

- **No React, anywhere:** not in the app, the packages, the test suite, the examples or the
  fixtures.
- **No npm package without the person's approval,** named and asked for before it's added. Prefer
  Deno's standard library (`jsr:@std/*`) and code written here.
- **Nothing downloads or installs a dependency without asking first.** That includes a command
  that pulls packages as a side effect: Deno caches every npm package a project's `deno.lock`
  lists, on any run in that project, whether or not the code imports them.
  - Run Deno with `--cached-only` when a command shouldn't fetch anything. It covers only the
    process it's passed to: a script that starts `deno` itself (`lint:security` does) isn't
    covered, and `deno lint` has no such flag.
  - To be sure nothing downloads, child processes included, also set `HTTPS_PROXY` and
    `HTTP_PROXY` to a dead local port (`http://127.0.0.1:9`), so a fetch fails instead.
  - If a command starts downloading anyway, stop it, say which packages it was fetching and why,
    and ask before running it again.

**Why:** a `lint:security` run imported one npm package, so Deno downloaded every npm package in
tranquil-test-suite's lockfile, React among them, with no prompt. The run was then repeated instead
of being reported. Later, with that import gone and the run under `--cached-only`, the lint's own
`deno lint` processes downloaded them again, because the lockfile still listed them.

## Known gaps

- **The CDP port (ADR-0028, proposed).** `src/main-process/start.js` opens
  `remote-debugging-port` (9222) in every build. Its target list includes Tranquil's own
  Node-enabled windows, and the runner grants the port to any script with a browser grant, so a
  `tabs`-only script can run Node.js in the main window. The decision: no port unless
  `TRANQUIL_CDP_PORT` is set and the app is unpackaged; the host attaches `webContents.debugger`
  per tab and forwards only each grant's operations. **No native build ships until the port is
  closed by default.** When implementing, add a `lint:security` rule: `remote-debugging-port` only
  behind `!app.isPackaged`.

Related: [browser.md](browser.md) (IPC channels, code in pages), [automations.md](automations.md).
