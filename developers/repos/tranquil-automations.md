<!-- For agents working on Tranquil's repos. Never shipped. -->

# tranquil-automations

The automation runner and SDK. Users write automations as standalone Deno scripts; this package
runs them as sandboxed Deno subprocesses (ADR-0022) and gives them the SDK they import as
`tranquil/automation` (ADR-0026). Read [rules/automations.md](../rules/automations.md) first.

## Layout

- `deno/`: the SDK, shipped as loose `.ts` files that user scripts import.
  - `mod.ts` (public surface), `tabs.ts`, `page.ts`, `forms/` (targeting, fill, accessible names),
    `guard.ts` (`sites=` and the submit guard), `log.ts`, `context.ts`, `cdp.ts`, `rpc.ts`,
    `transport.ts`, `handle.ts`, `main.ts` (the entry the runner starts);
  - `grants.ts`: the one typed list of grant names (`Capability`) and what each implies. SDK
    checks and the lint plugin take grants from it; `lib/permissions.js` keeps a JavaScript copy
    for the runner, held to it by `test/lib/permissions_test.ts`. Anything in the SDK that takes a
    grant takes a `Capability`, so a misspelled one fails `deno check`;
  - typed boundaries: `cdp.ts` declares the CDP commands and events the SDK uses (`Commands`,
    `Events`), so a new protocol call is added there with its params and result; `rpc.ts`
    declares `HostApi`, what `lib/runner-capabilities.js` serves, and a host method added or
    changed there is changed in `HostApi` in the same edit;
  - `lint/`: the Tranquil lint plugin applied to scripts (brittle CSS, literal secrets, unconfirmed
    submit, undeclared sites, page rules);
  - `testing.ts`: helpers for SDK tests.
- `lib/`: the Pulsar package (renderer side).
  - `run-manager.js`, `deno.js`, `permissions.js`, `consent.js`: start runs, compute Deno flags
    from the header, ask for approval;
  - `runner-capabilities.js`: what the host does for a script (tabs, UI, files) over the runner
    bridge;
  - `deno-config-seed.js`: writes `~/.tranquil/automations/deno.json` (the `STD` import table);
  - `runs-panel.js`: the Automation Runs panel;
  - `pane-controls*.js`, `tab-controls.js`, `tree-view-controls.js`, `vertical-tabs-view.js`,
    `folder-counts.js`, `row-actions.js`: workspace UI;
  - `settings.js`, `call-in-page.js`.
- `test/`: mirrors the source (`test/deno/…`, `test/lib/…`).
- `docs/README.md`: points to the published docs.

The rules for LLMs writing automations are not here: they live in tranquil-llm
`users/writing-automations.md`. A change to the SDK's exports, error codes or options updates that
guide in the same change.

## Commands

```sh
deno task test    # SDK and lib tests
deno task check   # type-check the SDK's public entry points
```

`deno.json` here is the SDK's own dev config. Scripts never use it: the runner always passes the
seeded `~/.tranquil/automations/deno.json`. The SDK imports its dependencies by full specifier
(`no-import-prefix` is off on purpose), because user scripts import its files directly.

Related tests elsewhere: tranquil-test-suite `test:sdk` (in-app) and `test:conformance` (WPT
accessible names); tranquil-llm `deno task test` (the guide against this SDK).

## Docs to keep in step

www-tranquil: the SDK section (`sdk`, `sdk-skill`, `sdk-permissions`, `sdk-automation`, `sdk-forms`,
`sdk-custom-parts`, `sdk-page-code`, `sdk-testing`;
the Overview's diagrams describe `handle.ts`, `cdp.ts`, `rpc.ts` and `forms/runtime.ts`, so a change
to how a script reaches the page or the app updates them), Automate with the Tranquil Skill, Running Automations,
Debugging, ADR-0022/0026/0027, and `drafts/api/pane-controls-api-reference` for `lib/pane-controls.js`.
