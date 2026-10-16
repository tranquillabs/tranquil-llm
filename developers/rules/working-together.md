<!-- For agents working on Tranquil's repos. Never shipped. -->

# Working together

How changes are tested, debugged and paced on this project.

## Manual testing comes first

Make the change, say what to test, and wait. Don't run GUI verification (the `verify` workflow, a
CDP-driven check) after a change unless asked.

**Why:** new behavior is exercised by hand before any automated driving.

## Don't touch the live app

When diagnosing a bug, don't connect to the running app's windows over CDP, and never quit or
restart it to test something: a restart once lost every open window and session. Reproduce in
tranquil-test-suite's isolated instance instead ([tools/test-suite.md](../tools/test-suite.md)).
Read-only inspection of a live window (checking state, never dispatching or clicking) is a smaller
ask, but still try the isolated harness first. **Never use puppeteer** for this; the test suite's
Deno CDP client is the tool.

## Watched debugging stays in the main thread

When a reported bug is being tracked down with someone watching, don't hand the investigation to a
background agent, not even for read-only research. Do the reading and testing directly, narrate
findings and discarded hypotheses as they happen, and check in (a quick empirical test, a
screenshot, "is there a test that reproduces this yet?") rather than running long and silently.

**Why:** a background investigation once ran 17 minutes with no visible reasoning before producing
anything usable, and was stopped. Background agents remain fine for large, independent work that
was handed off and isn't being watched turn by turn.

## Test tool behavior before designing on it

When a design depends on how a tool behaves (how an agent loads instruction files, which actions
prompt for approval, what a build includes), test that behavior in a scratch folder before the plan
is approved, and put the result in the plan. Read the tool's docs too, but don't rely on them alone.

**Why:** the first layout for tranquil-llm used `@path` imports, and only after it was built did it
turn out that Claude Code asks once per repo before loading an import from outside it, a
non-starter. A five-minute `claude -p` test in a scratch folder would have shown it, and showed
that links load with no approval.

## Pace

- No testing loops. Stop after two failed fixes, or about 20 minutes on one problem, and report.
- When asked for a plan, enter plan mode and write the plan there, so it can be iterated on before
  any code changes.

## Edit in place before a push

Anything created and not yet pushed (ADRs, docs, delivery notes, plans) is rewritten in place when
a decision changes. Keep no history of it: no retired status, amendment notes or dated changelog. A
dropped approach appears, at most, in an ADR's "Options considered". See [docs.md](docs.md).
