<!-- For agents working on Tranquil's repos. Never shipped. -->

# Types

Types are critically important: TypeScript in Tranquil's repos is fully typed. **No `any`,
anywhere, and no comment that switches the check off.**

**Why:** `any` turns type checking off for everything it touches, so a wrong name, shape or
argument compiles and fails at run time instead. Typing the automation SDK found real bugs the
`any`s were hiding:

- the lint rule for unconfirmed submits ignored `browser`, which implies `submit`, because the
  grant names were bare strings in two parsers;
- `fill()` read `.value` from a result that could be a failure;
- `waitFor` checked for a failure the runtime can never return;
- `tab.evaluate(fn, args)` never checked the arguments against the function's parameters.

## How to apply

Use the real type. When it is not obvious, reach for these:

| Instead of | Use |
| --- | --- |
| a value whose shape is not known yet | `unknown`, narrowed before use (`typeof`, `in`, a type guard) |
| "any function" | `(...args: never[]) => unknown` |
| "any array" of arguments | `unknown[]` |
| an object with optional extras | an intersection that declares them as optional: `El & { value?: unknown }` |
| a result type the caller names | a type parameter, defaulting to `unknown`, never `any` |
| JSON from outside (a socket, an env var, a file, a reply) | a declared interface, cast once where the data enters, with a comment saying whose contract it is |

- **Closed sets of names are literal types, not `string`.** Grants (`Capability`), error codes
  (`ErrorCode`), CDP commands and events (`Commands`, `Events` in `cdp.ts`), IPC channels
  (`CHANNELS`): one `as const` list or union, imported wherever a name is used, so a typo fails
  `deno check`.
- **Untyped data is typed at one boundary.** The host stub (`HostApi`), CDP replies and the page
  runtime's results each enter typed in one place; nothing downstream re-casts them.
- **Success and failure are a discriminated union** with literal `ok: true` / `ok: false` (write
  `ok: true as const` in an object literal so it does not widen to `boolean`). Narrow on `ok`
  before reading anything else.
- **Prefer inference to casts.** Let a function's return type follow from its code
  (`ReturnType<typeof createFormsRuntime>`), and use overloads where a caller may name a type
  instead of widening the signature.
- **`as unknown as` is a last resort,** for a partial test double or a declared boundary, with a
  comment. Never to make an error go away.
- **Pin type contracts with compile-time tests.** A test file that only has to type-check, with
  `@ts-expect-error` on each line that must stay an error (`test/deno/evaluate_types_test.ts`,
  `test/deno/cdp_types_test.ts`).
- **A public signature change is checked against every caller:** the examples, the test fixtures
  and the user guide (`deno check --config ../tranquil-llm/deno.json` over them).
- **JavaScript stays JavaScript.** The Pulsar packages are plain JS. Where JS and TypeScript meet
  (`lib/permissions.js` and `deno/grants.ts`, `lib/runner-capabilities.js` and `HostApi`), the
  TypeScript side declares the shape and a test or a rule keeps the two in step.

## Enforcement

`cd ../tranquil-test-suite && deno task lint:security` runs `tranquil-types/no-any`
(`lint/types.ts`) over every repo's TypeScript, tests and fixtures included, plus the website and
the user-facing script repos. It also fails on any `deno-lint-ignore` comment for `no-explicit-any`
or `tranquil-types/no-any`: there are no inline exceptions. See
[tools/lint-security.md](../tools/lint-security.md).
