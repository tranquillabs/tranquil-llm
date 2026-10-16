<!-- For agents working on Tranquil's repos. Never shipped. -->

# tranquil-drag-drop

Drag an editor or browser tab onto the tree-view to save it (browser tabs become collision-safe
`.url` files), with ⌥/⌘ to copy instead of move, and undo for tree-view file operations.

A tab dragged toward a dock is moved by the `tabs` package on `dragend`, not `drop`; keep items
out of docks with `getAllowedLocations()` on their model (see [rules/pulsar.md](../rules/pulsar.md)).
