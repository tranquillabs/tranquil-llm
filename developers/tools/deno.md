<!-- For agents working on Tranquil's repos. Never shipped. -->

# Deno

Deno is the scripting and test toolchain for Tranquil. It is required for development: automations
run as Deno subprocesses (ADR-0022), and several repos are Deno-only.

## Install and find it

```sh
curl -fsSL https://deno.land/install.sh | sh   # lands at ~/.deno/bin/deno
deno --version
```

`~/.deno/bin` is often not on the PATH of a non-interactive shell; call `~/.deno/bin/deno` or
prepend it. The app resolves its Deno from the `tranquil-automations.denoPath` setting, then `PATH`,
then `~/.deno/bin/deno`, `/opt/homebrew/bin/deno`, `/usr/local/bin/deno`. No binary is bundled yet.

## Deno only, never Python

- Never run `python` or `python3` for anything: edits, JSON, parsing output, one-off scripts. Use
  the editor tools for file changes and a small Deno script for anything that needs code. A
  multi-line `deno eval` with template literals escapes badly in a shell; write a script file in a
  scratch folder instead.
- **Deno-only repos:** tranquil-test-suite, www-tranquil, tranquil-llm, tranquil-app-template,
  tranquil-ops-demo. Never write `yarn`, `npm`, `npx` or `node` commands in them, even where a
  `package.json` exists (www-tranquil has one for its dependencies; its npm scripts are not the
  entry point, and running yarn there hits an old-Node corepack failure). Use `deno task …`.
- tranquil-client and the Pulsar-style packages are the exception: they use Node and Yarn 1 (see
  [dev-app.md](dev-app.md)).

## Running npm tools under Deno

Example, browser-sync as a dev server with no `package.json` (tranquil-app-template):

- `deno run -A npm:browser-sync@^3.0.0 start --server app --port 3000 --files "app/**/*" --no-open --no-notify`
  in a `deno.json` task. (Scope the permissions in an owned repo; `lint:security` rejects bare
  `-A` in the repos it scans.)
- Don't set `"nodeModulesLinker": "hoisted"` without `"nodeModulesDir": "manual"`, which in turn
  needs a `package.json` and `deno install`. Without a `package.json`, omit both.
- browser-sync injects its reload script only when the request's `Accept` includes `text/html`;
  check with `curl -H 'Accept: text/html'`.
- The "Ignored build scripts for packages: npm:fsevents" warning is harmless.
