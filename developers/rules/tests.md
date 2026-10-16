<!-- For agents working on Tranquil's repos. Never shipped. -->

# Tests

## Where tests live

- **In a package's top-level `test/` folder, never beside source.** It mirrors the source paths
  (`test/deno/forms/resolve_test.ts` tests `deno/forms/`), and the package's own `deno task test`
  runs it. Source folders hold only source, so a test is never told apart by its name alone.
- **Upstream forks** (`language-csv`, `pdf-view`) keep their upstream `spec/` folders.
- **tranquil-test-suite** holds tests that launch the app, span repos, or carry third-party test
  data (for example the WPT accname conformance data).
- **tranquil-llm** holds the test that ties the automation guide to the SDK.
- **A test reaches source, fixtures and other repos by name** (`deno.json` imports), never by
  counting `../` from its own folder; see [paths.md](paths.md).

## Owned packages never ship their tests

`script/electron-builder.js` excludes `test/`, `spec/`, `testdata/` and `*_test.*` from the app
build for `tranquil-*`, `language-csv` and `pdf-view`. A new owned package whose name is not
`tranquil-*` must be added to those exclusions.

Both rules are enforced by `lint:security` (`tests-in-test-folder`, `no-shipped-tests`), which
evaluates every owned package's test files against the real build patterns. See
[tools/lint-security.md](../tools/lint-security.md).

## Running and debugging

- How to run the suites and drive an isolated app instance: [tools/test-suite.md](../tools/test-suite.md).
- Changes are tested by hand first; see [working-together.md](working-together.md).
