<!-- For agents working on Tranquil's repos. Never shipped. -->

# tranquil-rpc

Object-capability RPC on Cap'n Web (`capnweb@0.9.0`, MIT) between the host renderer and trusted
browser guests (ADR-0003), and the token WebSocket bridge to automation subprocesses
(`lib/runner-host.js`, ADR-0022). First consumer: pane controls.

## Build

```sh
npm run build   # esbuild via build.mjs
```

It produces `dist/host.js` (CommonJS, `atom`/`electron` external, for the renderer) and
`dist/tranquil-rpc-guest.js` (an IIFE the host injects into trusted pages). Both carry a
`Promise.withResolvers` polyfill. `dist/` is committed: production has no build step. A Node harness
needs Node 20.16 (older Node lacks globals capnweb touches).

## Rules

- **Only `file://` pages under registered roots are trusted**; they get the runtime and
  capabilities. Everything else gets nothing. Default-deny is security-critical.
- **Consumers import `RpcTarget` from `require("tranquil-rpc")`**, never `capnweb` directly:
  capnweb detects capabilities with `instanceof`, so a subclass must extend the exact class bundled
  here.
- **Argument stubs are disposed when the call returns.** A function passed as an argument is valid
  only during that call. To keep it, `.dup()` it and dispose the dup later (the per-session
  `CompositeDisposable` in the capability context is where they go).
- **A capability's shape is its factory's return type:** a bare function is called as
  `host.name(...)`; an `RpcTarget` is a namespace, `host.name.method(...)`.
- **Only prototype methods and getters are reachable;** capnweb rejects an `RpcTarget`'s own
  instance properties. `buildHostApi(ctx)` returns an object whose prototype carries a lazy getter
  per capability.
- **Types:** `types/host-api.d.ts` (guest surface, `window.tranquilHost`) and
  `types/tranquil-rpc.d.ts` (consumer module). Keep the API reference pages in step (see
  [rules/docs.md](../rules/docs.md#pages-kept-in-step-with-code)).
- Transport channel: `tranquil:rpc` (host `webview.send` and `ipc-message`; guest through the page
  bridge's `sendToHost`/`receive`).
