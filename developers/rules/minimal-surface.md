<!-- For agents working on Tranquil's repos. Never shipped. -->

# Build the smallest surface that does the job

Don't add a feature because a comparable tool has it. Add it when something in Tranquil's own flow
will use it.

**Why:** in the form-filling SDK work, `llms.txt` was cut as over-engineering ("the use case is
weak"), followed by eight more pieces: a `schema()` that restated `fields()`, an automatic
saved-page target check (about 200 lines, confusing, and the live check already covered
it), a version stamp with an update command for a generated file (just rewrite the file), a stdin
run mode, a browser-name diagnostic, a lint rule that duplicated a run-time refusal, and over-long ADR and
guide text. Then the whole `tq` command line went: a second product surface (a CLI, its installer,
a main-process socket, files in every project) to save a person from starting each run.

## How to apply

- Before adding an aid, name its consumer and what breaks without it.
- If an existing primitive or a simpler rule covers it (regenerate the file, let the run-time check
  speak), don't build it.
- When cutting something, record the removed piece and why under "Options considered" in the ADR,
  so the reasoning survives.
- Don't propose CLIs, sockets or scaffolding to take the person out of the automation loop (see
  [automations.md](automations.md)).
