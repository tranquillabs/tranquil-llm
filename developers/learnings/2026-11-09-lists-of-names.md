---
title: "Lists of names: checked against where they come from, held to one source"
description: "The security lint's lists of Deno and Electron names, typed against their owners' declarations and held to the app's own list by a test: before and after code, and the improvement in a line."
---
<!-- For agents working on Tranquil's repos. Never shipped. -->

# Lists of names: checked against where they come from, held to one source

Page-isolation review, tranquil-test-suite `lint/security.ts`. A literal type alone caught nothing:
the lists are only compared with strings from parsed code, so a typo just never matches. A name is
checked only when something compares it with its owner.

## Deno's flags: typed against `Deno.PermissionName`

```ts
// before
const UNSCOPED_DENO = /^(--allow-(all|read|write|net|env|run|ffi|sys|import|scripts)|-A)$/;
```

```ts
// after
type DenoPermission = Deno.PermissionName;
const DENO_PERMISSIONS = ["read", "write", "net", "env", "run", "ffi", "sys"] as const satisfies readonly DenoPermission[];
// Every permission Deno has is in the list above: one Deno adds fails the type check here.
type Unlisted = Exclude<DenoPermission, (typeof DENO_PERMISSIONS)[number]>;
const _everyDenoPermission: [Unlisted] extends [never] ? true : never = true;
const UNSCOPED_DENO = new RegExp(`^(--allow-(${[...DENO_PERMISSIONS, "import", "scripts", "all"].join("|")})|-A)$`);
```

**Improvement:** a typo fails the build, and so does a permission Deno adds.

## A page's settings: one source, held by a test

```ts
// before: three lists that had drifted
const MUST_BE_OFF = new Set([
  "nodeIntegration",
  "nodeIntegrationInSubFrames",
  "nodeIntegrationInWorker",
  "allowRunningInsecureContent",
  "enableRemoteModule",
  "experimentalFeatures",
]);
const MUST_BE_ON = new Set(["webSecurity", "contextIsolation", "sandbox"]);
const UNSAFE_WEBPREFERENCES = /nodeIntegration=(yes|true)|contextIsolation=(no|false)|sandbox=(no|false)|webSecurity=(no|false)/i;
```

```ts
// after: one object, the same as tranquil-browser's lib/pages.js
export const PAGE_PREFERENCES = {
  sandbox: true,
  contextIsolation: true,
  webSecurity: true,
  nodeIntegration: false,
  nodeIntegrationInSubFrames: false,
  nodeIntegrationInWorker: false,
  allowRunningInsecureContent: false,
  experimentalFeatures: false,
} as const;

// lint/browser_contract_test.ts
Deno.test("the lint's page settings are tranquil-browser's", () => {
  assertEquals({ ...PAGE_PREFERENCES }, { ...pages.PAGE_PREFERENCES });
});
```

**Improvement:** one list can't disagree with itself (the regex covered 4 settings of 9, missed
`nodeIntegration` on its own, and only checked `setAttribute`); the test catches the lint's copy
drifting from the app's; the same test reads `electron.d.ts` and found `enableRemoteModule` no longer
exists. Asking where else the settings live found the real gap: nothing checked a `<webview>` at
run time, so the main process now enforces `PAGE_PREFERENCES` in `will-attach-webview`.

## Where it stops paying

- A list nothing uses as names (the runner's grant value keys) needs no typing.
- Import the source when you can; copy and test only when you can't (a lint plugin, the SDK, a
  sandboxed preload).
- Can't load the declarations (`electron.d.ts` under Deno)? Read them as text and check the names.
