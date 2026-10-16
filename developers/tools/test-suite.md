<!-- For agents working on Tranquil's repos. Never shipped. -->

# The test suite

tranquil-test-suite (a sibling repo, Deno only) holds tests that launch the app, span repos, or
carry third-party test data. Run everything from that repo.

| Task | What it runs |
| --- | --- |
| `deno task test` | every GUI smoke suite (`smoke/main_test.ts`) against an isolated app instance |
| `deno task test:sdk` | the automation SDK suites (`smoke/sdk_test.ts`) |
| `deno task test:conformance` | WPT accessible-name conformance for the SDK's targeting |
| `deno task lint:security` | the security lint over every owned repo (see [lint-security.md](lint-security.md)) |
| `deno task serve:fixtures` | serves `fixtures/` on localhost for manual checks |

## The isolated instance

`smoke/lib/launch.ts` `launch()` starts a separate Electron instance: a throwaway `ATOM_HOME`
(seeded from `smoke/atom-home/config.cson`, theme pinned to `tranquil-business-dark`), its own
`--user-data-dir`, `TRANQUIL_VERIFY=1` so tranquil-test-suite opens as the project, and CDP on
port 9223 (`TRANQUIL_TEST_CDP_PORT` overrides), so it never touches a running dev instance on 9222
or the real `~/.tranquil`.

Drive it with `smoke/lib/cdp.ts`: `connectAtom()`, then `evalInAtom()` and `waitFor()` on the
`Cdp` class. This is also the tool for reproducing a reported bug without touching the live app
(see [rules/working-together.md](../rules/working-together.md)); never puppeteer.

- **CDP evaluations return primitives.** Returning a model object (`returnByValue`) fails with
  "Object reference chain is too long".
- **The editor only draws rows in view.** A check on a gutter decoration or line must scroll its
  row into view first; a dock opened by another suite can shrink the editor.
- **Suites run in one instance in order.** A failure that appears only in the full run is usually
  state left by an earlier suite; run the failing suite first, alone, to tell.
- **A suite that writes files** makes its own temp folder and removes it when done
  (`smoke/suites/url-bookmark-save.ts`); nothing is written into the repo.
- Assert on your own fixtures as subsets: the app opens some panes on its own.

## Adding a suite

Write `smoke/suites/<name>.ts` exporting `async (cdp) => void`, then register a `t.step(...)` in
`smoke/main_test.ts` (or `sdk_test.ts`). Fixtures go in `fixtures/`, kept small.

Open testing ideas and known gaps are in tranquil-test-suite `TODO.md`.
