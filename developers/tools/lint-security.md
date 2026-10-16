<!-- For agents working on Tranquil's repos. Never shipped. -->

# lint:security

The security rules in [rules/security-first.md](../rules/security-first.md), as code. Run it after
any change to owned code, the build config, or an LLM file:

```sh
cd ../tranquil-test-suite && deno task lint:security
```

It scans every owned repo whole (the `OWNED` list in `lint/run-security.ts`), plus the files in
tranquil-client's `src/` and `static/` that have no counterpart in the Pulsar checkout at
`../pulsar` (so only Tranquil's own additions). A missing sibling repo fails the run.

## The checks

These are the rules it enforces, grouped by what they guard:

| Rule | Fails on |
| --- | --- |
| `no-blanket-permission` | a permission, device or display-media handler that grants without checking |
| `no-generic-ipc-bridge` | a preload method that takes a channel name from the page |
| `no-unscoped-deno-permission` | a bare `--allow-*` or `-A`, in code, `bin/` launchers or `deno.json` tasks |
| `no-string-page-code` | code built as a string and run in a page |
| `no-insecure-webpreferences` | a webview or window without context isolation and sandbox |
| `no-unbound-server` | `Deno.serve`/`listen` without a hostname (listens on every interface) |
| `tests-in-test-folder` | a test file in an owned package outside its top-level `test/` |
| `no-shipped-tests` | a test file the app build (`script/electron-builder.js` `files`) would ship |
| `no-path-climbing` | a path anchored to the file's folder that climbs two or more levels or names a sibling repo after `../`; runs over tests too (`lint/paths.ts`, see [rules/paths.md](../rules/paths.md)) |
| `tranquil-types/no-any` | `any` in any repo's TypeScript (tests and fixtures too, plus the website and user-facing script repos), or a comment that silences it (`lint/types.ts`, see [rules/types.md](../rules/types.md)) |
| `llm-files` | an `AGENTS.md`/`CLAUDE.md` in tranquil-llm, a file there without its header line, a code repo whose `CLAUDE.md` or `.claude/CLAUDE.md` is not a link into tranquil-llm, whose `.claude/settings.json` doesn't list `../tranquil-llm`, or whose `AGENTS.md` holds rules; an instruction file in a user-facing repo; a skill that isn't a link into tranquil-llm |

## Exceptions and new rules

- An exception is a line comment with a reason:
  `// deno-lint-ignore tranquil-security/<rule> -- reason`.
- When a new kind of blanket grant turns up, add a rule to `lint/security.ts` (or a check to
  `lint/run-security.ts` for non-JavaScript files), with a probe in its test showing it fails.
- A new owned repo goes in `OWNED`.
