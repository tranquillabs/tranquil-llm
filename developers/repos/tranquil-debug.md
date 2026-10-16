<!-- For agents working on Tranquil's repos. Never shipped. -->

# tranquil-debug

Breakpoint and step debugging for automations (ADR-0025). It launches a run under Deno's V8
inspector and drives the CDP `Debugger` domain directly; there is no debug adapter in between.

- `lib/debug-session.js`, `lib/cdp-client.js`: the session and its inspector connection.
- `lib/breakpoints.js` (gutter column, F9, persisted), `lib/current-line.js`,
  `lib/source-map.js`, `lib/module-bindings.js`, `lib/page-scope.js`.
- `lib/debug-panel.js`, `lib/variables-tree.js`, `lib/debug-controls.js`: the left-dock panel
  and the Debug button beside Run in the editor's pane controls.

Runs go through the same runner and permission flags as tranquil-automations; read
[tranquil-automations.md](tranquil-automations.md). In-app checks: tranquil-test-suite's
debugger and breakpoint suites ([tools/test-suite.md](../tools/test-suite.md)).
