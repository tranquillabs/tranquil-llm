---
title: "Flags that describe and flags that guard: a union for what a thing is, a table for where it is"
description: "The workbook run card's booleans became one step state (a discriminated union) and a run state machine (a typed transition table): before and after code, and the improvement in a line."
---
<!-- For agents working on Tranquil's repos. Never shipped. -->

# Flags that describe and flags that guard: a union for what a thing is, a table for where it is

Workbooks step 2, pass 3, tranquil-automations. Booleans either describe what a thing is (use a
union) or guard where a process is (use a table).

## What a step is: flags to a union

```js
// before: lib/workbook-service.js
return {
  ...run,
  grants,
  source: script.text + (script.truncated ? CUT_NOTE : ""),
  hasRun: Boolean(last),
  changed,
  running: isRunning,
  canRun: !isLocked && !isRunning,
};
```

```ts
// after: ui/workbook/types/service.ts
export type StepState =
  | { kind: "refused"; reason: string }
  | { kind: "new" | "current" | "changed"; script: ScriptModel }
  | { kind: "running"; phase: ActivePhase; script: ScriptModel };
```

**Improvement:** 16 flag combinations become 5 real states; each kind carries only its own data;
worked out once (`runModel`), never stored. The workbook's lock stays separate (`model.locked`).

## Where a run is: a Set to a table

```js
// before
const running = new Set();
if (running.has(k) || !runManager || locked(filePath)) return;
running.add(k);
// … start, wait, write the output …
running.delete(k);
```

```ts
// after: ui/workbook/run-machine.ts
export const RUN_TABLE: RunTable = {
  idle: { run: "starting" },
  starting: { started: "running", refused: "writing", threw: "writing" },
  running: { ended: "writing", threw: "writing" },
  writing: { written: "idle", writeFailed: "idle" },
};

export function next(phase: RunPhase, event: RunEvent): RunPhase | null {
  return RUN_TABLE[phase][event] ?? null;
}

export function can(phase: RunPhase, event: RunEvent): boolean {
  return next(phase, event) !== null;
}
```

```ts
// after: ui/workbook/service.ts, one phase per step; not listed means idle
function advance(filePath: string, k: string, event: RunEvent): void {
  const from = phaseOf(k);
  const to = next(from, event);
  if (to === null) throw new Error(`A step's run can't go from ${from} on ${event}.`);
  if (to === "idle") phases.delete(k);
  else phases.set(k, to);
  redraw(filePath);
}
```

**Improvement:** every move written down and type-checked (`RunTable`); nothing to forget on the
way out (`try … finally` back to idle); the UI asks `can(phase, "run")`, so a second click is
turned away by the table. The new refused-run test also found a signing bug (`blockBody`).

## Apply it

1. List the combinations that happen; each is a kind.
2. Give each kind only its data.
3. Work the union out in one function; don't store it.
4. A process over time gets a table: phases and events as literal unions, the table typed.
5. One phase per instance; "not listed" is the start.
6. Move it with one function; return to the start on every way out.
7. The UI asks `can`.
8. Test the table on its own, then the service.

Weighed and passed over: XState (2.3 MB, not on the Svelte packages list), `@xstate/fsm`
(unmaintained), typescript-fsm (not on the list). A plain typed table needs about 20 lines.

## Where it stops paying

- One boolean is fine: two states, nothing impossible.
- No process, no table: a toggle has no moves.
- Nested or parallel states, timers, many machines: that's a library's job (ask first).
- Share `next`/`can` at the second machine, not the first.
