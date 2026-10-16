<!-- For agents working on Tranquil's repos. Never shipped. -->

# Owned packages and third-party code

Tranquil is a fork of Pulsar. Most of tranquil-client's `src/` and all of its `packages/` are
upstream code. Tranquil's own work lives in owned packages, each its own repo cloned as a sibling
of tranquil-client (the list is in [repos/tranquil-client.md](../repos/tranquil-client.md)).

## Never modify code Tranquil doesn't own

- Not Pulsar's core packages (`tabs`, `tree-view`, `settings-view`, `packages/*`), and not
  `node_modules/` (unless it is a symlink to an owned repo).
- **Never edit `node_modules/`** at all: changes there are untracked and lost on the next
  `yarn install`. A change to a package that ships in tranquil-client goes in `packages/` (tracked)
  only when that is truly unavoidable; if a package exists only in `node_modules/`, ask first.
- Avoid editing upstream files in `src/`: every edit is a conflict on the next upstream merge.
  Tranquil-only modules (files with no Pulsar counterpart, such as
  `src/main-process/window-session-cleanup.js`) are fine.

**Why:** patches to upstream code fight every `upstream/master` merge, and the branch strategy
exists to keep that merge clean.

## Fix upstream behavior from an owned package

Pick the lightest mechanism that works:

1. **Implement the expected interface on our own models** (for example
   `terminatePendingState()` on `HTMLEditor`, `getAllowedLocations()` to keep an item out of docks).
2. **Override a core command from tranquil-config.** Register the same command on the same
   selector in `tranquil-config/src/index.js` `activate()`, guard for the case being changed, call
   `event.stopImmediatePropagation()`, and let core handle the rest. It works because on a
   specificity tie the most recently registered listener runs first
   (`src/command-registry.js:30`), packages activate after core, and the registry honors
   `stopImmediatePropagation` (`src/command-registry.js:363`). It also catches menu accelerators,
   which dispatch on `document.activeElement` and bubble (`src/atom-environment.js`
   `dispatchApplicationMenuCommand`), the only route a key takes when a `<webview>` guest has
   focus. Worked example: `core:close` (⌘W) closing the dock's item when a dock has focus, since
   `closeActivePaneItemOrEmptyPaneOrWindow()` reads `getCenter()` unconditionally.
3. **No command layer? Capture the DOM event.** When the behavior is a raw DOM handler inside a
   third-party dependency (for example xterm.js opening links with `shell.openExternal`), do **not**
   monkeypatch the npm class's prototype, even from an owned package. Instead:
   - `atom.workspace.observePaneItems`, duck-typing on `item.constructor.name`;
   - get the element with `atom.views.getView(item)`, **not** `item.getElement()` (which may still
     be unset when `observePaneItems` fires; `getView` creates and caches the view);
   - add the listener with `capture: true` on that element, so it runs before the dependency's own
     bubble-phase listener on a child;
   - only `preventDefault()`/`stopPropagation()` when your check matches, so the dependency's own
     fallback still fires otherwise.

   Worked example: `tranquil-config/src/index.js` `observeTerminalLinks()` (terminal cmd-click
   opens a Tranquil browser tab), using only xterm's public `Terminal` API.
4. **Tree-view changes go in tranquil-config**, never tranquil-automations: `patchTreeView()` gets
   `atom.packages.getActivePackage('tree-view')?.mainModule?.treeView` and calls each patch, each
   guarded by a `__tranquil*` flag; `activate()` runs it now or on `onDidActivatePackage`. The
   tree-view pane-control buttons (`tree-view-controls.js`) stay in tranquil-automations: they are
   part of the pane-controls system, not a behavior patch.
5. **A new package** when none of the above fits.

## Package loading

- **Owned packages load as bundled** from `tranquil-client/node_modules/<name>`, a `../../<name>`
  symlink that `yarn install` creates from the `link:../<dir>` entry in **both** `dependencies` and
  `packageDependencies` of tranquil-client's `package.json`. A new owned package needs both entries
  and the symlink; the `~/.tranquil/dev/packages/<name>` link alone does not load it. Symptom of a
  missing `node_modules` link: `getActivePackage` returns a stub with `metadata: {name}` only,
  `mainModule: null`. Fix without reinstalling: `ln -s ../../<name> node_modules/<name>`, then fully
  restart.
- **Requires resolve from the sibling repo's real path**, not tranquil-client's module tree. A
  top-level `require('some-app-dependency')` throws at load, activation aborts, and no commands
  appear, with no visible error. A package requires only `atom`, its own files, or a dependency in
  its own `node_modules`. Prefer zero dependencies (one command per option rather than a picker
  library). If a package's commands don't appear, suspect a throwing require first, then check
  `atom.packages.getActivePackage('<name>')` in the dev console (⌥⌘I).
- **Restorable workspace items declare their deserializer in `package.json`**
  (`"deserializers": { "Name": "deserializeName" }` plus that method on the main module), never with
  `atom.deserializers.add()` in `activate()`. Window start runs `loadPackages()`, then
  `deserialize(state)`, then `activate()`, so a deserializer added in `activate()` is too late and
  the item is silently dropped (`src/pane.js`). Seen as a right-dock panel reopening on every reload.
  Related dock facts: a dock reveals itself on `onDidActivatePane` (`src/dock.js`), so anything
  that grabs focus in a hidden dock reopens it.
- **New owned package whose name is not `tranquil-*`:** add it to the test exclusions in
  `script/electron-builder.js` (see [tests.md](tests.md)).

Related: [pulsar.md](pulsar.md), [settings.md](settings.md).
