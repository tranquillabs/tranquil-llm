<!-- For agents working on Tranquil's repos. Never shipped. -->

# Git

## Commit and push only when asked

After a change, stop. Run `git add`, `git commit` or `git push` only when explicitly asked ("commit
this", "commit and push", "push"). Creating a GitHub repo or anything else outside the machine
waits for an explicit go-ahead too.

## Commit messages

- Write a real message: concise (one line is fine), about what changed and why, not implementation
  details. No empty messages.
- **Never add an AI co-author or attribution line** (`Co-Authored-By: Claude` or similar), in any
  repo.

## Branches

- **Owned repos:** work on `main`. No pull requests: when a feature branch is done, merge it
  straight into `main` and move on.
- **tranquil-client:** `tranquil/main` is the development branch; all work goes there. `master`
  tracks `upstream/master` (Pulsar) and is never committed or merged to directly. Changes reach it
  only through an intentional `git merge --allow-unrelated-histories tranquil/main` when
  integrating upstream.
- **Forks of upstream projects** (deno-dom; and the same idea for any future fork): `master`
  mirrors upstream and is never committed to; Tranquil work goes on `tranquil-main`, release tags
  are cut from it, and upstream PRs are cut from `master`. See
  [repos/deno-dom.md](../repos/deno-dom.md).

## www-tranquil publishes on push

Deno Deploy builds and publishes `www-tranquil` on every push to `main`. There is no CI config in
the repo to hint at it. Treat any push there as publishing to `www.tranquillabs.dev`.
