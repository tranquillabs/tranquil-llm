<!-- For agents working on Tranquil's repos. Never shipped. -->

# tranquil-window-color

A per-window identity accent color (ADR-0007), the visual companion to per-window browser
sessions.

- It injects `:root { --tq-window-accent; --tq-window-accent-fg }` per window with
  `atom.styles.addStyleSheet` (a stable `sourcePath`, so re-injecting replaces). The foreground is
  black or white by luminance.
- Only the status bar is tinted. Every UI theme's status-bar style uses
  `var(--tq-window-accent, <theme default>)`, so unset means no change. The native title bar can't
  be tinted.
- Storage: the `tranquil-window-color.assignments` setting maps each `windowSessionId` to a preset,
  so colors survive restarts. Assignments for windows that no longer exist are cleaned up.
- UI: one command per preset (`tranquil-window-color:set-<key>`), `clear-color`, and a Window →
  Window Color menu. Zero dependencies (a picker library would not load from a dev package; see
  [rules/owned-packages.md](../rules/owned-packages.md#package-loading)).
