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

Typing tranquil-automations' plain JavaScript (the runner's and the pane controls' capabilities)
found more:

- tranquil-rpc's published declarations had drifted from its code: no `requires` option, no
  `grants` on a run's context, and an `any` that the lint never saw because it skipped `.d.ts`
  files;
- the IPC channel `clear-site-cookies` was spelled out in two repos instead of coming from
  `CHANNELS`;
- the same helper (`webviewOf`) existed twice in one package.

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

- **Types and interfaces go in their own files, apart from code.** They are building blocks, not
  code. A `types/` folder holds them, one file per module they describe, named after it: the
  package's `types/` for its `lib/` JavaScript (`types/run-text.ts` for `lib/run-text.js`), and a
  `types/` beside TypeScript in `ui/` (`ui/workbook/types/format.ts` for `ui/workbook/format.ts`),
  so it moves with that code. Code and tests import them with `import type`. A types file holds
  only `type` and `interface` declarations. It's plain `.ts`, not `.d.ts`: TypeScript treats a
  declaration file as a trusted description of code elsewhere, and checks commonly skip it
  (`skipLibCheck`). A `.d.ts` is only for declarations published to other packages, such as
  tranquil-rpc's `types/`, and `lint:security`'s no-`any` check covers those too.
- **Closed sets of names are literal types, not `string`.** Grants (`Capability`), error codes
  (`ErrorCode`), CDP commands and events (`Commands`, `Events` in `cdp.ts`), IPC channels
  (`CHANNELS`): one `as const` list or union, imported wherever a name is used, so a typo fails
  `deno check`.
- **Shared names and settings have one source.** A value two places agree on (a channel name, a
  session name, page settings, a grant) is declared once and imported. Code that can't import it
  (a sandboxed preload, the Deno SDK, a lint plugin) keeps a copy that a test holds to the source,
  as `lint/preload_channels_test.ts` and `lint/browser_contract_test.ts` in tranquil-test-suite do.
  Never a second hand-written copy with nothing checking it.
- **Another project's names are checked against its declarations.** A list of Electron settings
  or methods, or of Deno permissions, is tied to where those names come from:
  `satisfies readonly Deno.PermissionName[]` with a check that no name is missing, or a test that
  reads `electron.d.ts` when the declarations can't be imported. A typo, or a name the project
  drops, then fails a check instead of quietly matching nothing. The review that found this:
  [learnings/2026-11-09-lists-of-names.md](../learnings/2026-11-09-lists-of-names.md).
- **Use a package's own declarations; fix them at the source.** Type against what a package
  publishes (`import("tranquil-rpc").RunnerContext`, `typeof import("tranquil-rpc")`), never a
  local stand-in. When they're wrong, correct them in that package, along with any page that quotes
  them, and change a hand-written `.d.ts` in the same commit as the code it describes.
- **Tranquil's additions to someone else's type are declared once, where they're read.** Pulsar's
  load settings carry Tranquil's `windowSessionId`, which Atom's published types don't list; one
  function reads it, with an intersection cast that names the field
  (`WindowLoadSettings & { windowSessionId?: string }`), and the rest of the code calls that
  function.
- **A runtime check is a type guard.** When code already checks a value (a location against a
  list, a key's type), write the check as a guard (`(x): x is PaneLocation => …`) or narrow with
  `typeof` and `in`, so the type follows the check instead of a cast.
- **Untyped data is typed at one boundary.** The host stub (`HostApi`), CDP replies and the page
  runtime's results each enter typed in one place; nothing downstream re-casts them.
- **Success and failure are a discriminated union** with literal `ok: true` / `ok: false` (write
  `ok: true as const` in an object literal so it does not widen to `boolean`). Narrow on `ok`
  before reading anything else.
- **State is one value, not a set of booleans.** What a thing is now is a discriminated union,
  worked out where its data is read. Where a process is over time is one phase per instance, moved
  by a typed transition table, and the UI asks the table (`can`) instead of reading a flag. The
  pattern and the steps to apply it:
  [learnings/2026-11-05-run-state-machine.md](../learnings/2026-11-05-run-state-machine.md) (the
  workbook run card).
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

## Plain JavaScript

Plain JavaScript is typed too, through JSDoc, so the editor checks it as strictly as TypeScript.
tranquil-automations' `lib/` is the model: `jsconfig.json` turns on `checkJs` and `strict` for it,
and maps `electron` to tranquil-client's declarations, since the package doesn't install Electron.

When writing or changing a JavaScript module:

1. **Shapes go in its types file,** `types/<module>.ts`, as for TypeScript. Shapes the module shares
   with others (a browser tab's webview, its pane item) go in the types file of the module that
   provides them (`types/browser-pages.ts`).
2. **Name them at the top** with `/** @typedef {import("../types/<module>.ts").Shape} Shape */`, and
   tranquil-rpc's or another package's with `import("<package>").Name`.
3. **Every function and method gets `@param` and `@returns`.** Module-level `let`s, empty
   collections (`new Map()`, `[]`) and class fields get `@type`.
4. **What arrives from a script, a page or IPC is `unknown`** until the code checks it, and the
   check narrows it (see "A runtime check is a type guard" above).
5. **A cast goes from a wider declared type to a narrower one at one place,** with a note saying why
   (a pane item that is known to be a browser tab, Tranquil's field on load settings). Never a cast
   to quiet an error.
6. **Check the editor's problems for each file you changed** before handing the work over (in
   Claude Code, the `getDiagnostics` tool). Spelling notes and the "may be converted to an ES
   module" hint aren't type problems.

## Enforcement

`cd ../tranquil-test-suite && deno task lint:security` runs `tranquil-types/no-any`
(`lint/types.ts`) over every repo's TypeScript, tests and fixtures included, hand-written `.d.ts`
declarations, the website and the user-facing script repos. It also fails on any `deno-lint-ignore`
comment for `no-explicit-any` or `tranquil-types/no-any`: there are no inline exceptions. See
[tools/lint-security.md](../tools/lint-security.md).

Plain JavaScript is checked only in the editor today: no lint step runs `checkJs` yet, because it
needs the TypeScript compiler and Atom's type declarations, which the editor fetches for itself.
Until one does, step 6 above is the check, and a review of the Problems panel catches the rest.
