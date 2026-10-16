<!-- For agents working on Tranquil's repos. Never shipped. -->

# tranquil-config

App-wide configuration and the place where Tranquil adjusts core and bundled-package behavior.

- `src/index.js`: the package main. It holds:
  - the **Tranquil settings tab** (`createTranquilSettingsPanel`) and the app-wide `tranquil.*`
    settings it declares (`TRANQUIL_SETTINGS`; see [rules/settings.md](../rules/settings.md));
  - **core command overrides** (⌘W `core:close` for docks, center-scoped Ctrl+Tab
    `tranquil:show-next/previous-item-in-center`; see
    [rules/owned-packages.md](../rules/owned-packages.md#fix-upstream-behavior-from-an-owned-package));
  - **tree-view patches** (`patchTreeView()` and each guarded patch);
  - **DOM-capture overrides** for third-party packages (terminal cmd-click links, Markdown preview
    links);
  - the command-palette MRU sort (see [rules/pulsar.md](../rules/pulsar.md));
  - a load-settling guard that re-hides docks that restored hidden (a restored terminal focuses
    itself and would reopen the bottom dock).
- `src/generated/`, `generate.js`, `keys.js`, `write_config.js`, `config.json`: generated settings
  data.
- Settings-tab widgets follow the design system and layout rules in
  [rules/ui-themes.md](../rules/ui-themes.md).
