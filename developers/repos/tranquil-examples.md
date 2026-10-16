<!-- For agents working on Tranquil's repos. Never shipped. -->

# tranquil-examples (user-facing)

Runnable automation examples that users clone and open as a project. It is not part of the app: no
dependency, no seeding, no menu item. Each folder is one self-contained example (the script, a
short README, and anything it writes).

This repo is cloned by users, so it has **no developer instruction file**: an agent there is a
user's agent writing automations, and follows `~/.tranquil/llm/writing-automations.md`. Every
script's first line is the pointer to it. When changing an example, follow the same guide
(tranquil-llm `users/writing-automations.md`), ask for the lowest grant that works, and keep the
examples README table in step. Each example has a docs page in www-tranquil (`example-<name>`) that
shows its script verbatim: a changed script updates that page in the same change.
