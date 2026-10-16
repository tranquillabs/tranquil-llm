<!-- For agents working on Tranquil's repos. Never shipped. -->

# Working on Tranquil

Tranquil is an Electron desktop app forked from Pulsar, built from several sibling repos under one
parent folder: tranquil-client (the app), owned packages (one repo each), tranquil-test-suite,
www-tranquil (the website and docs), and this repo, tranquil-llm. These files are for agents
changing Tranquil's code. The user guides in `../users/` are product content for users' LLMs; they
are not instructions for working on any repo.

Every code repo links this file (`.claude/CLAUDE.md`) and its own file in [repos/](repos/)
(`CLAUDE.md`), so both load at startup. Read the rest when the work touches its subject. Links in
these files are relative to where they sit in tranquil-llm: `rules/git.md` here is
`../tranquil-llm/developers/rules/git.md` from a code repo.

## Always

- [rules/security-first.md](rules/security-first.md): default-deny; nothing past the Deno sandbox;
  no permission that wasn't explicitly specified; run `lint:security`.
- [rules/working-together.md](rules/working-together.md): manual testing first, never touch the
  live app, watched debugging stays in the main thread, pace, plan mode.
- [rules/git.md](rules/git.md): commit and push only when asked, no AI co-author, branches.
- [rules/writing-style.md](rules/writing-style.md): plain and specific wording, no em dashes, no personal names,
  "Tranquil" not "Pulsar", footnoted sources. Applies to every doc, note, commit and reply.
- [rules/minimal-surface.md](rules/minimal-surface.md): build only what something in Tranquil's
  own flow will use.
- [rules/types.md](rules/types.md): TypeScript is fully typed: no `any`, closed name sets as literal
  types, untyped data typed at one boundary.

## Rules by subject

| File | Read before |
| --- | --- |
| [rules/owned-packages.md](rules/owned-packages.md) | changing behavior that comes from Pulsar or a third-party package; adding or loading a package |
| [rules/pulsar.md](rules/pulsar.md) | using Pulsar's workspace, opener, menu, palette or config APIs |
| [rules/settings.md](rules/settings.md) | adding or reading a package setting |
| [rules/tests.md](rules/tests.md) | adding or moving a test |
| [rules/paths.md](rules/paths.md) | reaching another repo, or a fixed place in this one, from code |
| [rules/browser.md](rules/browser.md) | touching browser tabs, webviews, the page bridge, IPC channels, or code run in pages |
| [rules/keyboard.md](rules/keyboard.md) | adding or fixing a shortcut, focus handling, menu accelerators |
| [rules/automations.md](rules/automations.md) | changing the automation runner or SDK |
| [rules/ui-themes.md](rules/ui-themes.md) | styling anything, the settings panel, rendering glitches |
| [rules/docs.md](rules/docs.md) | writing docs, ADRs, delivery notes, plans or release notes |

## Tools

| File | Covers |
| --- | --- |
| [tools/dev-app.md](tools/dev-app.md) | `yarn start`/`verify`, reloads, reading the app's output, crashes |
| [tools/test-suite.md](tools/test-suite.md) | running the suites; the isolated app instance for reproducing bugs |
| [tools/lint-security.md](tools/lint-security.md) | the security lint and its rules |
| [tools/deno.md](tools/deno.md) | installing Deno, Deno-only repos, no Python, npm tools under Deno |
| [tools/gh.md](tools/gh.md) | the GitHub CLI's location |

## Repos

One file per repo, linked as that repo's `CLAUDE.md`:

- the app: [tranquil-client](repos/tranquil-client.md) (also the owned-package list and dev setup);
- packages: [tranquil-automations](repos/tranquil-automations.md),
  [tranquil-browser](repos/tranquil-browser.md), [tranquil-config](repos/tranquil-config.md),
  [tranquil-debug](repos/tranquil-debug.md), [tranquil-rpc](repos/tranquil-rpc.md),
  [tranquil-tips](repos/tranquil-tips.md), [tranquil-drag-drop](repos/tranquil-drag-drop.md),
  [tranquil-window-color](repos/tranquil-window-color.md),
  [tranquil-theme-icons](repos/tranquil-theme-icons.md);
- themes: [tranquil-business-dark](repos/tranquil-business-dark.md),
  [tranquil-business-light](repos/tranquil-business-light.md) (active),
  [tranquil-theme-dark](repos/tranquil-theme-dark.md),
  [tranquil-theme-light](repos/tranquil-theme-light.md) (inactive);
- forks: [atom-pdf-view](repos/atom-pdf-view.md), [atom-language-csv](repos/atom-language-csv.md),
  [deno-dom](repos/deno-dom.md);
- [tranquil-test-suite](repos/tranquil-test-suite.md), [www-tranquil](repos/www-tranquil.md);
- user-facing, with no instruction file of their own:
  [tranquil-examples](repos/tranquil-examples.md),
  [tranquil-app-template](repos/tranquil-app-template.md).

## Skills

- [skills/tranquil-docs/](skills/tranquil-docs/SKILL.md): reviewing and authoring www-tranquil doc
  pages. Linked into `www-tranquil/.claude/skills/`.

## Adding to this repo

A new file goes in the folder for its kind, opens with the header line, and is linked from this
index (`deno task test` in tranquil-llm checks all three). See the [README](../README.md).
