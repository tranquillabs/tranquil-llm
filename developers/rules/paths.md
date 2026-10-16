<!-- For agents working on Tranquil's repos. Never shipped. -->

# Reach other repos and files by name, not by counting `../`

Tranquil is several sibling repos. Code that needs another repo, or a fixed place in its own repo,
names it once and refers to it by that name. It never counts `../` from its own file:

```ts
// No: breaks when this file moves, and hides the dependency in a code body.
const sdk = new URL("../../../tranquil-automations/deno/", import.meta.url);

// Yes: the location is declared once, in deno.json.
const sdk = import.meta.resolve("tranquil/automation");
```

**Why:** a path counted from a file's depth breaks silently when the file moves or a folder is
added, and the dependency on a sibling repo sits in a test body instead of the repo's config. A
review found it in eleven files across three repos.

## How to apply

- **Deno: an entry in `deno.json` `"imports"`.**
  - A sibling repo: `"<repo>/": "../<repo>/"`, then import from `"<repo>/..."` or call
    `import.meta.resolve("<repo>/...")`.
  - The repo itself: `"<repo>/": "./"` (`tranquil-llm/`, `tranquil-test-suite/`,
    `tranquil-automations/` for its tests).
  - The folder every repo is cloned into, only for code that walks all of them:
    `"tranquil-repos/": "../"`.
  - The public SDK keeps its own name, `tranquil/automation`, as user scripts see it.
- **To get a folder path from a name,** use `resolve(fromFileUrl(import.meta.resolve("<repo>/")))`;
  `resolve` drops the trailing slash.
- **Node: `require.resolve("<package>/...")`,** as `src/main-process/user-guides.js` finds
  tranquil-llm.
- **Allowed:**
  - relative imports inside a package's own source tree (`./forms/types.ts`, `../log.ts` in the
    SDK, which ships as loose files with no import map);
  - one level up inside a package (`path.join(__dirname, "..", "resources")`), since a Pulsar package
    loaded from a sibling repo cannot `require` itself by name.
- **Not covered:** paths in `deno.json` and `package.json` (the declared places), and strings that
  are data rather than a path being resolved (a link target the code writes, a message).

`lint:security` enforces this with `tranquil-paths/no-path-climbing` (`lint/paths.ts` in
tranquil-test-suite), over every owned repo including tests. It flags an anchored path that climbs
two or more levels, or names a sibling repo after `../`. See
[tools/lint-security.md](../tools/lint-security.md).
