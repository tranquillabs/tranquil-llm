<!-- For agents working on Tranquil's repos. Never shipped. -->

# Page types

Four shapes are in use across the tree. Identify which one you're writing or
reviewing before applying Pass 1's type-mismatch check.

Two of these have an authoritative conventions page already in the repo. Where one
exists it wins — this file records only what it doesn't cover.

---

## Guide — `guides/**`

Task-oriented, written for someone with the app open. 10 pages.

- H1, then one or two sentences of orientation with inline cross-links.
- Optional `<blockquote class="callout-warn">` dev-preview banner.
- `##` sections named for tasks, not for subsystems.
- Keybinding and API tables — each with a lead-in (Pass 3).
- **The only type with a navigational closer**: a `---` rule, then
  `**Next:** [Page](../slug/) — one clause on why.`

Two guides in the chain currently have no closer (`guides/studio/overview`,
`guides/studio/preferred-settings`), so the Next chain is broken. Worth fixing
when you're in either file; not worth a dedicated pass.

---

## ADR — `development/adr/NNNN-short-title/`

**Authoritative template: `src/routes/docs/development/adr/overview/+page.svx`.**
Read it before writing one. It defines the frontmatter block, the section order,
the status lifecycle, and five rules — including that `## References` goes at the
*top*, under the status line, not at the bottom.

Beyond what that page says:

- Frontmatter is `type`/`id`/`title`/`status`/`date`, with the ADR number in the
  H1 and a *short* title in the frontmatter. `superseded_by` only when superseded.
- ADRs 0001–0013 predate that template and use bare `title`/`description` with
  the number embedded in the title. **Do not copy them** — copy 0017–0025.
- `## Options considered` is expected; three recent ADRs omit it.
- Newer ADRs cite with footnotes (`[^1]:` definitions at the bottom).
  `remark-footnotes` is pinned at v2 — see `markup.md`.
- "Once active, never edit — supersede instead." Take this seriously; it's the
  rule most likely to be broken by a well-meaning tidy-up pass.

---

## Delivery note — `development/notes/`

The delivery log for work that shipped, usually paired with an ADR. 38 pages, a
softer template than the ADRs but a real one.

- H1, then a `>` blockquote lede naming it as a delivery summary and pointing at
  the companion ADR — the note says *what shipped and where*, the ADR says *why*.
- `## Status` with a bolded state and a `| Piece | State |` table.
- Recurring sections: what shipped, where everything lives, gotchas worth
  remembering, follow-ups.
- Usually ends with a numbered manual-verification checklist. No closer.

Section naming has drifted across these files — `Verify` / `Verified` /
`Verification` / `How it was verified`, and `Follow-up` / `Follow-ups` /
`Deferred`. Prefer **`## Verification`** and **`## Follow-ups`** in new notes.

---

## API reference — `drafts/api/`

**Authoritative template:
`src/routes/docs/drafts/api/api-reference-conventions/+page.svx`.** It specifies
the Scalar-vs-hand-written lane choice, the reference-vs-concept page split, an
eight-part page skeleton, the per-member template, the `## Source & full types`
appendix, and slug naming.

Note that `drafts/**` is dev-only — gated by a `!dev → error(404)` guard in
`docs/drafts/+layout.ts`, excluded from the search index, and not prerendered.
A `description` on a drafts page is inert until the page moves out of drafts.

---

## Frontmatter, across all types

| Key | Who reads it |
|---|---|
| `title` | **Nothing.** The `<Seo>` title comes from the `docs.ts` label — and only after hydration; see SKILL.md Pass 5 |
| `description` | `src/lib/search/build-index.ts`, for the search snippet |
| `type`, `id`, `status`, `date` | Nothing yet — ADR metadata, kept for humans |

`title` being inert is not a licence to let it drift from the H1: it's the first
thing a reader of the source sees, and 18 pages currently disagree with their own
H1. Keep frontmatter `title`, the H1, and the `docs.ts` label saying the same
thing.
