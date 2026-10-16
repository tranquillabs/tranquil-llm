---
name: tranquil-docs
description: >
  Write and review documentation pages in this repo — any `+page.svx` under
  `src/routes/docs/`. Use when asked to add a doc page, write a guide, record an
  ADR, write up delivery notes, document an API surface, or review, tidy, or
  restructure an existing doc page. Also use before committing changes to a doc
  page, and when a reader reports that a page is confusing, out of order, or has
  an example that doesn't work. Covers the five review passes, the page-type
  templates, and the mdsvex/render mechanics that silently break pages here.
---

<!-- For agents working on Tranquil's repos. Never shipped. -->

# Tranquil docs

Documentation in this repo is 134 `.svx` pages under `src/routes/docs/`, rendered
through mdsvex inside a SvelteKit layout. A page is **a fragment, not a document**:
the layout supplies the table of contents, the browser title, the palette and the
type. Advice that assumes a self-contained file is wrong here, which is why
`## Out of scope` below is as load-bearing as the passes.

## Before anything else: run the linter

```bash
deno task lint:docs --path src/routes/docs/writing-automations
```

It decides everything decidable — registration, anchors, link targets, trailing
slashes, fence languages, frontmatter, callout markup. Don't spend judgment on
what it already checks, and don't re-derive its checks by grepping.

**Fix only the findings on the page you're working on.** A tree-wide run reports a
backlog of roughly seventy pre-existing findings on pages nobody is touching. That
backlog is a to-do list, not a gate — which is why `lint:docs` is deliberately not
part of `deno task check`.

## Modes

| Mode | When | What you produce |
|---|---|---|
| **review** | "review this page", an existing page in hand | Linter output, then the five passes, then a findings list |
| **author** | "add a doc page", "write an ADR" | The page itself, in its type's template — no report |
| **lint** | "check the docs", pre-commit | Linter output only, adjudicated |

Default to **review** when given an existing page and **author** when creating one.

## The five passes

Apply in order. Each has a different failure mode in its sights.

### Pass 1 — Purpose and orientation

Does the opening tell a reader what they can *do* with this page?

- **Neighbour-relative opening.** Does the page open by defining its own title and
  routing the reader to other pages, rather than by saying what they can do here?
  Orientation links belong after that sentence, not as it.
- **Unnamed assumed context.** Product vocabulary — "the Engine", "the start
  page", "the bottom dock" — used with nothing establishing which app or surface
  the page assumes. One clause usually fixes it.
- **Type mismatch.** Is this shaped like what it is? A guide that never gives an
  instruction, an ADR with no decision, a delivery note with no "what shipped".
  See `references/page-types.md`.

Do **not** demand a request, decision, ask, or deadline. Reference pages exist to
be correct at the point of lookup; they are not persuasion documents.

### Pass 2 — Sequencing

The strongest pass. Order is a claim about importance, and readers believe it.

- **Convention used before it's defined.** Does a page use a syntax, header,
  flag, or file format in examples that a later section explains? This is the
  highest-yield check in the whole skill — chase it, because whatever it turns up
  is usually load-bearing.
- **Mechanism before use.** Does a section answer its own question in one
  sentence and then spend paragraphs on internals, resolution order, or
  troubleshooting? Demote the internals to a callout or a later subsection.
- **Two sections that are one section.** Sibling sections covering the same kind
  of content, split by a boundary the page never explains. Readers hunt for
  meaning in an unexplained split and find none.
- **Unannounced ordering.** If a sequence isn't ordered by importance, say what
  it is ordered by.

### Pass 3 — Scanability

- **Tables without a lead-in.** Every table gets a sentence above it answering
  "what does this cover, and when would I reach for it?" A heading is not a
  lead-in. This is the single most transferable rule here — tables are where
  search traffic lands, and a reader arriving from search hits them cold.
- **Prose that is really a list.** A paragraph carrying four independent rules in
  five lines hides three of them. Bullets make each one findable.
- **Heading depth.** `h2`/`h3` only — the layout's TOC scans exactly those, so an
  `h4` is invisible to navigation.

### Pass 4 — Examples and self-consistency

New, repo-specific, and the reason this skill exists. Prose review does not catch
any of it.

- **Does every runnable example obey the rules this page states?** If the page
  says a script needs a header, a flag, or a declaration, check that every
  example has one. Read the page's own rules, then audit the examples against
  them — do not assume the author did.
- **Would each example run as written?** Imports present and resolvable, no
  undefined references, no API the page documents differently elsewhere.
- **Do examples agree with the reference tables on the same page?** Signatures,
  option names, return types.
- **Fence languages** must be in the Shiki allowlist or the block renders as
  plain unhighlighted text — see `references/markup.md`. The linter checks this.

### Pass 5 — Markup, registration and links

Mostly the linter's job. Your job is to adjudicate what it reports:

- A **label/H1 mismatch** is real and matters: `src/lib/data/docs.ts` drives the
  sidebar, prev/next pager, breadcrumb, `<Seo>` title and search index, so its
  label is the page's effective name. The frontmatter `title` is read by nothing.
  *Known bug:* those are all `$derived` off `currentSlug`, which doesn't resolve
  during SSR (`base` is relative under `paths.relative`), so every docs page
  currently **prerenders** as `<title>Docs — tranquil docs</title>` and only gets
  its real title after hydration. The label still governs what a reader sees; it
  does not yet govern what a crawler sees.
- A **broken anchor** is never acceptable — `handleMissingId: 'warn'` cannot
  catch these at build time, and other pages link into this one's headings.
- **Renaming a heading breaks every inbound anchor.** Before changing heading
  text, grep for the slug across `src/routes/docs/`.
- A **missing `description`** costs the page its search snippet.
- **Trailing slashes** are required by `trailingSlash: 'always'`; without one the
  link costs a redirect.

## Severity

Three levels, meaning what they say:

- **broken** — wrong, unrunnable, or renders incorrectly. A reader following this
  fails.
- **friction** — correct, but costs the reader more than it should.
- **polish** — worth doing, no reader is harmed by it shipping.

A missing table lead-in is *friction*, not a crisis. Reserve **broken** for things
that are actually broken, or the scale stops carrying information.

## Out of scope

These are not this skill's business, and advice about them is actively wrong here:

- **Colour, typefaces, borders, spacing, emphasis palettes.** Every visual
  decision comes from `@theme` tokens in `src/app.css` and applies site-wide. A
  page cannot make them and must not try.
- **Filenames and versioning.** A page's name is a URL slug that other pages link
  to. Never suggest date-stamping it, adding a version suffix, or renaming it for
  searchability. Renaming a slug is a breaking change.
- **Demanding an in-page outline or table of contents.** `docs/+layout.svelte`
  builds one by scanning `h2`/`h3`. Writing one in prose duplicates the chrome and
  goes stale. *Caveat:* it's built client-side in a `$effect`, so prerendered and
  printed views have none — that's a layout limitation, not a page defect.
- **"State your conclusion first."** Correct for a proposal, wrong for a reference
  page organised for lookup.
- **Prescribing an ending.** Only 8 of 134 pages have a navigational closer, all
  guides. Don't add `**Next:**` to an ADR or a delivery note.

## Authoring a new page

1. Identify the type and follow its template — `references/page-types.md`.
2. Frontmatter needs `title` and `description`. ADRs additionally take
   `type`/`id`/`status`/`date`.
3. H1 first, matching the `docs.ts` label you're about to add.
4. **Register it in `src/lib/data/docs.ts`** or it is unreachable from the sidebar
   and absent from search. The linter catches this; don't rely on that.
5. Internal links get trailing slashes.
6. Run `deno task lint:docs --path <the new page>`, then `deno task check`.

## Writing conventions

- Tranquil and component names (Desktop, Server, Browser, Ecosystem) are
  title-cased in prose; lowercase only in code, CLI invocations and paths.
- Callouts are raw `<blockquote class="callout-warn">` with blank lines around the
  markdown body. `callout-note` has no CSS — it renders as a plain blockquote, so
  use `callout-warn` or a bare `>`.
- Bold marks UI labels, bullet leads and example titles. Those are structural and
  consistent. Bold used to emphasise an ordinary word competes with them — cut it.
