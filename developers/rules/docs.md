<!-- For agents working on Tranquil's repos. Never shipped. -->

# Docs, ADRs, delivery notes and plans

All of Tranquil's written record lives in **www-tranquil** under `src/routes/docs/`, served at
`/docs/<slug>/` (flat slugs). It is the published website: pages outside `drafts/` (including every
ADR and the Development group) are public and crawlable, and `drafts/*` is dev-only (`prerender =
false`, 404 in production). The sidebar, pager, search and sitemap are driven by
`src/lib/data/docs.ts`: **a page not registered there is unreachable**. Site facts are in
[repos/www-tranquil.md](../repos/www-tranquil.md).

## Every docs change goes through the `tranquil-docs` skill

When a `+page.svx` is created or edited (a guide, an ADR, a delivery note, one paragraph), run the
`tranquil-docs` skill on it before calling the work done: review mode for an existing page, author
mode for a new one. `deno task lint:docs --path <page>` is step one, not the review; the five passes
catch what the linter can't (a stale example, a table that omits half its subject, a verification
section implying more was exercised than was). Re-run the passes after late edits. Fix only
findings on the pages being changed; the tree-wide backlog is a to-do list, not a gate.

## ADRs

- **Location:** `www-tranquil/src/routes/docs/adr-NNNN-slug/+page.svx`, numbered monotonically.
  Never `tranquil-client/docs/decisions/` (that is Pulsar's upstream folder; the `create-adr` skill
  defaults there, so override it).
- **Format:** frontmatter `type: ADR`, `id`, `title`, `description`, `status`, `date`; then
  `**Status:** … · **Date:** …`, and sections References, Context, Decision, Options considered,
  Consequences.
- **Register** it in `docs.ts` (the Decisions list).
- **Editing:** before a push, rewrite in place and keep no history (see
  [working-together.md](working-together.md#edit-in-place-before-a-push)). After a push, an active
  ADR can still be edited to fold in follow-on work that completes the same decision; supersede
  only for a real reversal.

## Delivery notes

After each discrete effort, add a delivery note at
`www-tranquil/src/routes/docs/drafts/notes/<topic>-notes/+page.svx` (frontmatter `title` and
`description`), registered in the Notes group of `docs.ts` with slug `drafts/notes/<topic>-notes`.
It holds the plan (context and approach) and what was done: files changed, key decisions,
deviations found during implementation, verification, follow-ups. When a plan file is also wanted,
save it in `~/Documents/Tranquil/Plans/` (dated, `YYYY-MM-DD-topic.md`) and link it from the note.

**Why:** each unit of work documents itself in one place, in step with the code.

## Pages kept in step with code

- **API reference pages** embed `.d.ts` and signature excerpts, so they drift silently. Update them
  in the same change as their source:
  - `drafts/api/host-api-reference` ← `tranquil-rpc/types/host-api.d.ts`;
  - `drafts/api/module-api-reference` ← `tranquil-rpc/types/tranquil-rpc.d.ts`;
  - `drafts/api/pane-controls-api-reference` ← `tranquil-automations/lib/pane-controls.js`.

  Follow `drafts/api/api-reference-conventions`, and keep the two `register` functions apart
  (guest `paneControls.register(items)` versus host `register(match, items)`).
- **Pulsar upstream fix candidates:** when a fix turns out to be an inherited Pulsar bug, add an
  entry (symptom, root cause, where the fix lives, upstream status) to
  `drafts/notes/pulsar-upstream-fixes`.
- **Automate with the Tranquil Skill, the SDK section (`sdk`, `sdk-*`) and ADR-0026/0027** must agree with
  `users/writing-automations.md` in this repo.
- **Each Examples page (`example-*`) shows its tranquil-examples script verbatim**, so a changed
  example script updates its page in the same change.

## Release notes

Unreleased notes go in the separate `drafts` array in `www-tranquil/src/lib/data/releases.ts`;
array membership is the gate (there is no `draft` flag). It is joined only under
`import.meta.env.DEV`, so a production build drops the array and its prose. A runtime filter on one
combined array is not enough: the markdown would still ship in a public JS chunk (check by grepping
the build output). To publish, move the entry to the top of `published`. The homepage version reads
`releases[0].version`; never hardcode a version string. Mastodon announcements: `deno task toot`.

## mdsvex

`{` and `}` in prose are Svelte expressions. Keep object shapes inside backticks or code fences.

## Diagrams

Mermaid fences render at build time through www-tranquil's own plugin
(`src/lib/remark/beautiful-mermaid.js`) and are styled in `src/app.css`. Render a diagram and look
at it before it goes in a page: a layout that reads in source can come out unreadable.

- **Vertical over horizontal**, with short arrow labels; details go in the text or a table.
- **Sequence diagrams:**
  - `loop` frames show only their label (the plugin drops the keyword); a frame inside another is
    inset and tinted.
  - `-->>` (drawn dotted) marks optional steps; say "(optional)" on the first one.
  - `%% emphasis: You, Skill` ranks participants by importance; the first stands out most.
- **No braces in labels**: they break the Svelte parse.

Related: [writing-style.md](writing-style.md), the `tranquil-docs` skill in
[skills/tranquil-docs/](../skills/tranquil-docs/SKILL.md).
