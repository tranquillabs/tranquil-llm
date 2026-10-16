<!-- For agents working on Tranquil's repos. Never shipped. -->

# deno-dom

Tranquil's fork of `b-fuze/deno-dom`, a Deno module, not an app package: it is neither linked in
`package.json` nor linked into `dev/packages/`. It supplies the module-scoped DOM types behind the
automation SDK's `Page` declaration and the offline field-resolution tests (ADR-0026).

- **Branches:** `master` mirrors `upstream/master` and is never committed to. All Tranquil work
  goes on `tranquil-main`. Upstream PRs are cut from `master`.
- **Releases:** tags `v0.1.56-tq.N` are cut from `tranquil-main`. The SDK imports a pinned tag by
  GitHub URL (`tranquil-automations/deno/page.ts`, `deno/testing.ts`), so a change reaches the
  SDK only after it is tagged and the pin is bumped.
- It keeps its upstream test layout (`test/`, root `*.test.ts`) to keep merges easy.
- No `:has` selector support.
