<!-- For agents working on Tranquil's repos. Never shipped. -->

# tranquil-test-suite

The tests that launch the app, span repos, or carry third-party test data, plus the security lint.
It is **Deno only**: no `yarn`, `npm`, `npx`, `package.json` or `node_modules`; dependencies come
from `jsr:`/`npm:` specifiers in `deno.json`, and the harness spawns Electron directly. The isolated
interactive launch (`yarn verify`) belongs to tranquil-client; refer to it there, never add a yarn
command here.

How to run the suites and drive the isolated instance: [tools/test-suite.md](../tools/test-suite.md).
The security lint: [tools/lint-security.md](../tools/lint-security.md).

## Layout

| Path | What it holds |
| --- | --- |
| `smoke/` | GUI smoke tests: `main_test.ts` and `sdk_test.ts` (runners), `lib/` (`launch.ts`, `cdp.ts`, `sdk.ts`, `fixture-server.ts`), `suites/` (one file per feature), `atom-home/config.cson` |
| `fixtures/` | small tracked files the suites open, and pages served by `serve:fixtures` |
| `conformance/` | WPT accessible-name conformance for the SDK, with its third-party test data |
| `lint/` | the security lint (`security.ts` rules, `run-security.ts` runner, `security.jsonc`) and its tests |
| `TODO.md` | the testing backlog and ideas |

The project opened by the isolated instance is this repo, so fixtures sit where the suites expect
them. Fixture automations run with Tranquil's seeded config like any other script.
