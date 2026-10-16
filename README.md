# tranquil-llm

Everything Tranquil writes for LLMs, in one place. It has two audiences, kept in two folders that
are never mixed:

| Folder | Read by | Ships with Tranquil? |
| --- | --- | --- |
| [`developers/`](developers/index.md) | agents working on Tranquil's own repos (rules, tools, per-repo facts, skills) | no, never |
| [`users/`](users/) | a Tranquil user's LLM, writing automations (the **user guides**) | yes, published to `~/.tranquil/llm/` on every app start |

The two are different in function, not just in reader. A file in `developers/` tells an agent how
to change Tranquil's code. A file in `users/` is part of the product: it tells a user's LLM how to
write an automation, and it must never be read as instructions for working on any repo.

## How each audience finds its files

- **Developers.** In every code repo, `CLAUDE.md` is a link to its `developers/repos/<repo>.md`,
  `.claude/CLAUDE.md` is a link to `developers/index.md`, and `.claude/settings.json` lists
  `../tranquil-llm` in `additionalDirectories`. All three are committed, so Claude Code loads the
  index and the repo's file at startup with no setup and no approval, and can read the files the
  index links to. An `@path` import would not do: Claude Code asks once per
  repo before loading an import from outside it. An `AGENTS.md` says the same in plain words for
  other agents. The index links every other file, with a line on when to read it.
- **Users.** Tranquil copies `users/` to `~/.tranquil/llm/` on start (tranquil-client
  `src/main-process/user-guides.js`). Each user guide is named directly by a pointer, for example the
  first line of every automation:

  ```ts
  // Tranquil automation. Rules for writing and changing it: ~/.tranquil/llm/writing-automations.md
  ```

## Conventions

- **Topic-named files.** No file here is named `AGENTS.md` or `CLAUDE.md`: agents load files of
  those names automatically, and this repo is content, not a project to work on.
- **A header line on every file**, naming its audience:
  - `developers/`: `<!-- For agents working on Tranquil's repos. Never shipped. -->`
  - `users/`: `<!-- User guide: shipped with Tranquil and published to ~/.tranquil/llm/ for users' LLMs. Not instructions for working on any repo. -->`

  A skill's `SKILL.md` carries it right after its frontmatter.
- **One topic per file**, in the folder for its kind:
  - `developers/rules/`: how to work (one subject per file);
  - `developers/tools/`: how to use one tool;
  - `developers/repos/`: facts specific to one repo;
  - `developers/skills/`: agent skills, linked into the repos that use them;
  - `users/`: one user guide per file.
- **Adding a file:** put it in the right folder, give it the header line, and link it from
  `developers/index.md` (developers) or name it from its pointer (users).

## Checks

- `deno task test` runs:
  - `test/structure_test.ts`: the conventions above hold;
  - `test/users/writing_automations_test.ts`: the automation user guide matches the SDK in the sibling
    `tranquil-automations` repo (the core exports are mentioned, the error table lists exactly the
    SDK's error codes, every example type-checks and starts with the pointer line).

  `deno.json` declares where the SDK is (`tranquil/automation`, the same mapping
  tranquil-test-suite uses) and names this repo `tranquil-llm/`, so tests resolve paths through
  those names rather than counting `../` from their own folder.
- `cd ../tranquil-test-suite && deno task lint:security` includes the `llm-files` check: it fails on
  an `AGENTS.md` or `CLAUDE.md` in this repo, a file without its header line, or a code repo
  whose links, settings or `AGENTS.md` don't point here.

## Skills

Claude Code loads project skills from a repo's `.claude/skills/`. A skill lives in
`developers/skills/<name>/`, and each repo that uses it links to it:

```sh
ln -s ../../../tranquil-llm/developers/skills/tranquil-docs ../www-tranquil/.claude/skills/tranquil-docs
```

The decision and its options are recorded in ADR-0029 (www-tranquil `adr-0029-llm-files`).
