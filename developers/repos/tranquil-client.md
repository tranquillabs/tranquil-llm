<!-- For agents working on Tranquil's repos. Never shipped. -->

# tranquil-client

The Tranquil app: an Electron desktop app forked from Pulsar (itself a fork of Atom). Most of `src/`
and all of `packages/` are upstream Pulsar code; Tranquil's own work lives in owned packages, each
in its own sibling repo, plus a few Tranquil-only files here. Read
[rules/owned-packages.md](../rules/owned-packages.md) before changing anything.

- **Branches:** `tranquil/main` is where all work goes; `master` tracks Pulsar and is never
  committed to (see [rules/git.md](../rules/git.md)).
- **Node:** `source ~/.nvm/nvm.sh && nvm use` before every `node`/`yarn` command (`.nvmrc`,
  20.16.0).
- **Config directory:** `~/.tranquil`, never `~/.pulsar`.
- **Pulsar docs:** <https://docs.pulsar-edit.dev/>. Read Pulsar's source from this repo, not the
  `../pulsar` checkout.

## Owned packages

The packages Tranquil owns, which tranquil-client links with `link:../<dir>` in both `dependencies`
and `packageDependencies`, so edits in the sibling repo are live without `yarn install`:

| npm name | Repo (`tranquillabs/…`) | Local dir |
| --- | --- | --- |
| `tranquil-automations` | `tranquil-automations` | `../tranquil-automations` |
| `tranquil-browser` | `tranquil-browser` | `../tranquil-browser` |
| `tranquil-config` | `tranquil-config` | `../tranquil-config` |
| `tranquil-debug` | `tranquil-debug` | `../tranquil-debug` |
| `tranquil-rpc` | `tranquil-rpc` | `../tranquil-rpc` |
| `tranquil-tips` | `tranquil-tips` | `../tranquil-tips` |
| `tranquil-drag-drop` | `tranquil-drag-drop` | `../tranquil-drag-drop` |
| `tranquil-window-color` | `tranquil-window-color` | `../tranquil-window-color` |
| `tranquil-theme-icons` | `tranquil-theme-icons` | `../tranquil-theme-icons` |
| `tranquil-business-dark` | `tranquil-business-dark` | `../tranquil-business-dark` |
| `tranquil-business-light` | `tranquil-business-light` | `../tranquil-business-light` |
| `language-csv` | `atom-language-csv` (fork of `ldez/atom-language-csv`) | `../atom-language-csv` |
| `pdf-view` | `atom-pdf-view` (fork of `izuzak/atom-pdf-view`) | `../atom-pdf-view` |

The two forks keep their upstream npm names, which differ from their repo names.

Other sibling repos, not linked into the app:

- **tranquil-llm**, this repo of LLM files. Linked as `"tranquil-llm": "link:../tranquil-llm"` so
  the app can ship `users/`; it is not a Pulsar package.
- **deno-dom** (fork of `b-fuze/deno-dom`), a Deno module behind the automation SDK's `Page` types
  and the offline field-resolution tests (ADR-0026). See [deno-dom.md](deno-dom.md).
- **tranquil-test-suite**, **www-tranquil**, and the user-facing repos **tranquil-examples**,
  **tranquil-app-template** and **tranquil-ops-demo**. `tranquil-examples` is not part of the app:
  no dependency, no seeding, no menu item; don't add it back.
- **tranquil-theme-dark/-light** are older themes, not linked and not active.

## Dev setup

Prerequisites: Node through nvm, Yarn 1, and **Deno** (see [tools/deno.md](../tools/deno.md);
without it the app launches but no automation runs).

Clone every repo as a sibling of tranquil-client:

```sh
cd ~/Documents/Tranquil/Repos
for r in tranquil-client tranquil-llm tranquil-automations tranquil-browser tranquil-config \
  tranquil-debug tranquil-rpc tranquil-tips tranquil-drag-drop tranquil-window-color \
  tranquil-theme-icons tranquil-business-dark tranquil-business-light atom-language-csv \
  atom-pdf-view deno-dom tranquil-test-suite www-tranquil; do
  git clone "https://github.com/tranquillabs/$r.git"
done
(cd deno-dom && git switch tranquil-main && git remote add upstream https://github.com/b-fuze/deno-dom.git)
git clone https://github.com/pulsar-edit/pulsar.git   # reference only; lint:security needs it
```

Install. `atom-pdf-view` has its own runtime dependencies and no `.nvmrc`, so pin Node for it:

```sh
cd atom-pdf-view && source ~/.nvm/nvm.sh && nvm use 20.16.0 && yarn install && cd ..
cd tranquil-client && source ~/.nvm/nvm.sh && nvm use
yarn install
git submodule update --init ppm && (cd ppm && yarn install)
yarn build   # electron-rebuild, if the app fails to launch after an install
```

Link the owned packages as dev packages, so they load from the sibling repos rather than as core:

```sh
mkdir -p ~/.tranquil/dev/packages
R=~/Documents/Tranquil/Repos
for p in tranquil-automations tranquil-browser tranquil-config tranquil-debug tranquil-rpc \
  tranquil-tips tranquil-drag-drop tranquil-window-color tranquil-theme-icons \
  tranquil-business-dark tranquil-business-light; do
  ln -s "$R/$p" ~/.tranquil/dev/packages/$p
done
ln -s "$R/atom-language-csv" ~/.tranquil/dev/packages/language-csv
ln -s "$R/atom-pdf-view" ~/.tranquil/dev/packages/pdf-view
```

This is Pulsar's own approach: packages in `dev/packages/` are found before `packageDependencies`
and get `isBundled: false`. In a packaged build the links don't exist and the packages load from
`node_modules` as bundled.

Link the skills each repo uses (see the tranquil-llm README):

```sh
mkdir -p $R/www-tranquil/.claude/skills
ln -s ../../../tranquil-llm/developers/skills/tranquil-docs $R/www-tranquil/.claude/skills/tranquil-docs
```

Agent instructions need no setup beyond cloning tranquil-llm next to the other repos. Each code
repo commits links into it (`CLAUDE.md`, `.claude/CLAUDE.md`) and a `.claude/settings.json` that
lets agents read it; see the tranquil-llm README.

Running, verifying and debugging the app: [tools/dev-app.md](../tools/dev-app.md).

## Tranquil's own files here

Files with no Pulsar counterpart, safe to change (and checked by `lint:security`):

- `scripts/dev.js`, `scripts/verify.js` (plural `scripts/`; upstream uses `script/`);
- `src/main-process/cz-init.js`: main-process IPC for the browser (typed channels from
  `tranquil-browser/lib/ipc.js`), forwarding page events to windows;
- `src/main-process/har.js`, `page-permissions.js` (deny by default), `window-session-cleanup.js`
  (clears and deletes the browser sessions, `persist:tb-window-<id>`, of windows closed for good), `stall-watchdog.js`,
  `tb-color-scheme.js`;
- `src/main-process/user-guides.js`: copies the user guides (tranquil-llm `users/`) to
  `~/.tranquil/llm/` on start.

Upstream files Tranquil has had to edit (keep the list short): `src/main-process/start.js` (the
remote debugging port, ADR-0028), `src/main-process/atom-application.js` (`TRANQUIL_VERIFY`
project filter), `src/main-process/atom-window.js` (`windowSessionId`).

## IPC path

Owned webview preload (`bp-client.js`) → `contextBridge.exposeInMainWorld` → `ipcRenderer` →
`ipcMain` in `cz-init.js` → forwarded to renderer windows → the owned package's renderer listener.
Channel rules: [rules/browser.md](../rules/browser.md).

## The app build

`script/electron-builder.js`:

- excludes `test/`, `spec/`, `testdata/` and `*_test.*` from owned packages (see
  [rules/tests.md](../rules/tests.md));
- **still drops every `.ts` and `.md` file** (Pulsar's
  `!**/*.{markdown,md,mkd,ts,jst,tgz,swp}`), which removes the automation SDK (`deno/`) and
  the user guides in tranquil-llm's `users/`. Before the first packaged build, add a re-include block after that
  pattern (last match wins) for `node_modules/tranquil-automations/deno/**` and
  `node_modules/tranquil-llm/users/**`, and verify with a real packaged build;
- still carries Pulsar branding (`appId`, product name, artwork), as does `start.js`'s
  crashReporter `productName`. Fix before shipping a binary.

No binary ships yet, but changes must keep the build ready for one. The ADR-0028 release gate
applies.

## ppm

`ppm` is a git submodule of Tranquil's fork, `tranquillabs/tranquil-ppm`, built once after cloning
(above). It provides `ppm/bin/ppm`, which settings-view uses to list installed packages; the fork
falls back to `packageDependencies` when `_atomPackages` is absent, as in a dev build (see the ppm
and Core Packages doc page). Tranquil doesn't use ppm to install or manage packages.
