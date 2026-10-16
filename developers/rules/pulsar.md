<!-- For agents working on Tranquil's repos. Never shipped. -->

# Working with Pulsar's APIs

## Check how Pulsar does it first

Before writing custom code for package loading, IPC, settings, ppm or any other Pulsar internal,
check how Pulsar handles it (<https://docs.pulsar-edit.dev/>) and prefer the upstream approach.

- **Read source from tranquil-client** (`src/workspace.js`, `src/pane.js`, …): it is the fork and
  holds the code that actually runs. The separate Pulsar checkout at `../pulsar` is a reference for
  approach only, and the input `lint:security` uses to tell Tranquil's files from upstream ones.
- **Config lives in `~/.tranquil`**, never `~/.pulsar` (`~/.tranquil/dev/packages/`,
  `~/.tranquil/config.cson`, and so on).

**Why:** upstream patterns are tested and keep the fork maintainable. Invented ones (like an old
ppm stub returning `[]`) caused bugs that following Pulsar would have avoided.

## Contracts that fail silently

- **`addOpener` declines with `false`.** A bare `return` (`undefined`) means "unclaimed", and
  `workspace.open()` falls through to opening the URI as a file path: a bogus `TextEditor` titled
  after its last segment (`tranquil-browser://blank` became an editor named "blank"). Return `false`
  on every early-decline path. If a URI scheme opens as a plain text file with a nonsense title,
  suspect this. Regression test: tranquil-test-suite `smoke/suites/browser-toggle-empty-pane.ts`.
- **The workspace remembers item locations.** `subscribeToMovedItems` (`src/workspace.js`) saves
  `uri → location` whenever an item lands outside its default location, and `open()` replays it when
  no `location` is passed. The store is app-global and rewritten on every run. Two opens of the
  same URI (one to a dock, one meant for the center) teach each other a location. Pass an explicit
  `location` on every open when any call places an item in a dock, and better, give each
  destination its own URI (a `?pane=` query is enough). Inspect with
  `await atom.workspace.itemLocationStore.load(uri)`.
- **`workspace.open` falls back to the center** when the requested location is not in the item's
  `getAllowedLocations()`.
- **Tabs dragged into a dock** are moved by `packages/tabs/lib/layout.js` on `dragend`, not `drop`,
  so stopping `drop` does nothing. Keep an item out of docks with
  `getAllowedLocations() { return ['center']; }` on its model.
- **Context-menu order** comes from DOM-walk depth and registration order, then groups are reordered
  only by `beforeGroupContaining`/`afterGroupContaining`. Selector specificity decides which
  duplicate wins, not order. To sit above another package's group, give the leading item
  `beforeGroupContaining: ["their:command"]` and keep a trailing separator.
- **`getActivePackage('command-palette')` always returns null.** To change the palette (the MRU
  sort in tranquil-config), track commands with `atom.commands.onDidDispatch`, install the sort
  lazily on the first `command-palette:toggle`, find the list via `atom.workspace.getModalPanels()`
  (`item.element.classList.contains('command-palette')`), and call
  `slv.update({order, items: slv.props.items})` (passing `items` triggers `computeItems()`).
- **Single-click preview in the tree-view** depends on `core.allowPendingPaneItems`: when false,
  single-click opens nothing. If preview breaks, check that setting (a stale user-config override
  caused it once) before any code.
- **Any package's settings are readable** with `atom.config.get('<package>.<key>')`, a public API.

Related: [owned-packages.md](owned-packages.md), [keyboard.md](keyboard.md).
