<!-- For agents working on Tranquil's repos. Never shipped. -->

# Writing style

These apply to everything written for people: docs, ADRs, delivery notes, release notes, plans,
commit messages, website copy, UI strings, and replies.

## No em dashes

Don't use em dashes (—) in prose. Reach for the plainer mark:

- A parenthetical pair becomes commas, or parentheses for a bare list: "the tree-view controls (New
  File, New Folder, Refresh, Collapse All) are absent until…".
- A trailing elaboration becomes a colon, or a full stop and a new sentence.
- Two joined clauses become a comma, or two sentences.
- A dash that carries only a hedge: cut the dash and the hedge.

**Why:** an em dash usually stands in for punctuation that does the job with less noise, and the
habit reads as a tic once several land on one page.

The `vX.Y.Z — Title` release separator is the one exception, and only where history already uses
it: GitHub release titles and tag messages keep the em-dash form from v0.1.0 on. Mastodon posts
(`scripts/toot.ts`) use a colon. Leave already-published copy alone unless asked.

## Impersonal, with no personal names

Never refer to the person you work with by name or personally in a written artifact: no names, no
"he/she/his", no "the user asked" where an impersonal form works. Write decision logs as
"Decisions made (date)", requirements as "Follow-up requirements (date)", gates as "a manual
read-through", rules as "commit only when explicitly requested". Paths that contain a home folder
name are literal and fine.

**Why:** documents read as project artifacts, not correspondence.

## Call the app Tranquil

The app is **Tranquil**. Say "Pulsar" only for the upstream project (for example "check how Pulsar
handles this"), never for what tranquil-client does. Tranquil and its components (Desktop, Server,
Browser, Ecosystem) are title-cased in prose; lowercase only in code, commands and paths.

## Say it plainly and specifically

Write what the reader gets, in everyday words, and name the actual thing.

- **Plain over clever.** "It's always up to date" and "Tranquil overwrites the file at its next
  start", not "it matches your Tranquil" or "it describes the SDK you have installed".
- **Name the things, not a category of your own.** "`fill`, `clear` and `fields()`", not "the
  verbs". Where a whole set is meant, use a term the docs define once and link to: "the SDK form
  methods" (defined on Forms API).
- **Qualify a term that could mean two things.** "Form methods" could be a page's or a script's
  own; "SDK form methods" can't.
- **Spell out a parenthetical or a vague condition.** "When the field works normally (you open it,
  pick an option, and it shows your choice)", not "when the field still works like a field".

**Why:** in the custom parts docs, each of these was rewritten after review: shorthand that read
clearly to the writer meant nothing to a reader, and a vague term had to be replaced twice.

## Words to avoid in user-facing copy

- **"frecency"** reads as a typo of "frequency". In release notes, site pages, UI strings and
  GitHub releases, say "history-ranked" or "ranked by how often and how recently you visit". It is
  fine in ADRs, code and algorithm docs.
- **Private motivations.** Docs and ADRs describe a capability generically. The User-Agent work
  (ADR-0019) was triggered by one site blocking the default UA; neither the site nor the reason
  appears in any doc, ADR, note or commit, and must not be added.

## Cite external sources with footnotes

Docs, plans, ADRs and notes that borrow from an outside source (articles, library docs, specs,
posts) link it with a markdown footnote: a `[^slug]` marker at the point of use and a
`[^slug]: Title, author or org, <url>` definition collected near the end. Do it for each distinct
source, without being asked.

**Why:** every borrowed claim stays traceable to its origin.

Related: [docs.md](docs.md).
