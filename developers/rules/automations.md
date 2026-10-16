<!-- For agents working on Tranquil's repos. Never shipped. -->

# Automations

These rules are for changing Tranquil's automation runner and SDK (tranquil-automations). The rules
a user's LLM follows to *write* an automation are product content:
[`users/writing-automations.md`](../../users/writing-automations.md), published to
`~/.tranquil/llm/writing-automations.md`.

## An automation needs no build setup (ADR-0027)

A Deno script declares everything it needs in the script itself:

- its dependencies, as imports by specifier (`jsr:`, `npm:`, `https:`) or by the short names
  Tranquil's config provides (`tranquil/automation`, `@std/*`, `capnweb`);
- what it may do, in its permission header (grants `tabs`, `forms`, `submit`, `page-js`, `browser`;
  `sites=`, `read=`, `write=`, `net=`, a timeout), which the runner turns into explicit Deno flags
  and the person approves;
- the data files it reads or writes, named in that header, relative to the script's folder;
- the user's own `.ts` modules it imports (`import { parts } from "./lib/parts.ts"`), each
  named in `read=` like any file it reads: the runner loads the script through a dynamic import, so
  Deno checks reads of every local module after the bootstrap.

"No accompanying files" means no build setup: no `deno.json`, `package.json`, install step,
`AGENTS.md` or `CLAUDE.md`, and a folder of scripts is not a project. It does not mean one file
only. An automation can be one file, or import modules the user wrote, like any TypeScript; how
reusable code is organized is up to the user. Tranquil supplies everything else from `~/.tranquil`:

- `~/.tranquil/automations/deno.json`, the only config (seeded by tranquil-automations
  `lib/deno-config-seed.js`). The runner, and `deno check`/`deno lint` as the guide tells agents to
  run them, always pass `--config` with it and never pick up a nearby `deno.json`.
- `~/.tranquil/llm/writing-automations.md`, the rules for LLMs, copied from this repo's `users/` on
  every start.

**Every automation's first line** points at those rules:

```ts
// Tranquil automation. Rules for writing and changing it: ~/.tranquil/llm/writing-automations.md
```

**Why:** automations can live in any folder, next to unrelated projects. A `deno.json` near a
script belongs to that project, not to Tranquil, and picking it up forced the project to repeat SDK
internals. Copies of rules beside scripts go stale. Agents load instructions only from their own
places, so they are told explicitly where to look instead of relying on how any one agent loads
files.

## How to apply

- Anything a script needs goes in the script; anything every script needs comes from
  `~/.tranquil`.
- A library scripts commonly need goes in the seeded import map (pinned and bumped with releases:
  the `STD` table in `deno-config-seed.js`). The SDK imports its own dependencies by full specifier
  (`npm:capnweb@0.9.0`) so the map never has to know SDK internals.
- A person runs every script: **SDK: Check Custom Parts** (form scripts: checks each write
  verb's target and the parts it needs, without acting), then **SDK: Run Automation**, and
  the Runs panel shows output, action log, `context.result` and errors. Don't
  propose CLIs, sockets or scaffolding to take the person out of the loop (the `tq` CLI was built and
  removed for this reason; see [minimal-surface.md](minimal-surface.md)).
- No LLM runs at run time. LLMs author scripts from the published rules.
- A change to the SDK's public surface (exports, error codes, options) updates
  `users/writing-automations.md` in the same change; `deno task test` in tranquil-llm fails until it
  does.

## The SDK works from web standards (ADR-0026)

SDK code (tranquil-automations `deno/`) names no framework, UI library or site, in code or
comments. It finds and drives fields by HTML, ARIA and the W3C accessible name, plus generic
conventions common across many sites (class words such as `question`, `active`, `required`,
`error`; a group of short buttons under one question). A form built some other way is described by
the user's own **custom parts map** (`tab.useCustomParts()`): data, never code, optional, and only
for a form that isn't built to standards when the default verbs should still drive it.

**Why:** the form SDK grew from one application form, and its first runtime read one dropdown
library's class names. The SDK can't follow every widget on the web; whoever scripts a page can
describe that page.

- `test/deno/neutral_test.ts` fails if `deno/` names a framework, library or site. Describe the
  structure instead ("a hidden checkbox behind a button group").
- Page-specific knowledge belongs in a map, never in the runtime. A new map field is added only
  when a real page needs it.
- **SDK: Map Custom Parts** (a built-in script, `deno/map-custom-parts.ts`, `tabs` only)
  drafts a map from the live page; it only keeps a selector it verified. **SDK: Check
  Custom Parts** checks a script's targets and parts. Neither is part of the script API.
- Third-party widgets are tested in tranquil-test-suite, never in the SDK's own tests.

## Runner and SDK facts

- **No interactive input.** The child runs with `stdin: "ignore"`, and a webview has no
  `window.prompt()`. Inputs come from a file named in the header, or the clipboard.
- **Every CDP call times out at 30 s** (`deno/cdp.ts`). Don't `evaluate` a promise that waits on
  a person; poll with `waitFor`.
- **`tab.evaluate(fn)` runs through CDP `Runtime.callFunctionOn`**, so it bypasses the page's CSP.
  Evaluating a stringified function inside the page would be blocked.
- `jsr:` imports are allowed by default. `files.read`/`files.write` resolve against
  `context.scriptDir` and hit disk (unsaved editor buffers are invisible).
- **Webviews are Chromium 139.** `Input.insertText` is silently dropped unless the host calls
  `webview.focus()` first. `Page.reload`, or moving a webview in the host DOM (a pane split),
  replaces the CDP target and closes the socket; `Page.navigate` doesn't. Inactive tabs are
  zero-size, not `display:none`, and still accept trusted clicks and text.
- deno-dom has no `:has`. Without the `dom` lib Deno uses `deno.window`. `deno run` never fetches
  type-only URL imports.
- **Two clocks.** The `.ts` script is a fresh subprocess each run, but the host capability it calls
  (`runner-capabilities.js`) is renderer code frozen at window load. A new SDK option sent to a
  window opened before the change is silently dropped. See
  [tools/dev-app.md](../tools/dev-app.md#reload-after-a-package-edit).

## Workflow engine (ADR-0023, proposed)

Phase 1 (the Deno runner, ADR-0022) is shipped. Phase 2 is the in-app workflow engine spike; its
gate is the 10-item checklist in the `automations-v2-notes` design notes, and its sharp edges
(SQLite in the main process, protocol-level cancel, a token socket, per-run snapshots, webhook auth,
journal secrets, scheduled runs blocking on changed permissions) are written into ADR-0023. Read
those before starting; the fallback is Restate.

## Old injection scripts

Plain `.js` automations that run in the renderer with the `atom` global (for example
tranquil-app-template `automations/open-app.js`) are the older model. New work uses Deno scripts.
