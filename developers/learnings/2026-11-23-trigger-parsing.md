---
title: "Reading a tagged string: from hand-sliced checks to a table you can read at a glance"
description: "Four review rounds on the parser for a run's trigger (`command:<name>`, `url:<url>`, …): before and after code for each, and the improvement in a line."
---
<!-- For agents working on Tranquil's repos. Never shipped. -->

# Reading a tagged string: from hand-sliced checks to a table you can read at a glance

Workbooks step 3a, tranquil-automations. A run's trigger is `manual`, `debug`, `command:<name>`,
`url:<url>` or `workbook:<path>`; the SDK reads it as `context.trigger`.

## Start: hand-sliced, in three places

```ts
function parseTrigger(raw: string): Trigger {
  if (raw.startsWith("command:")) return { kind: "command", name: raw.slice(8) };
  if (raw.startsWith("url:")) return { kind: "url", url: raw.slice(4) };
  return { kind: "manual" };
}
```

```js
if (trigger.startsWith("workbook:")) return path.basename(trigger.slice(9));
const attended = trigger === "manual" || trigger === "debug" || /^(command|workbook):/.test(String(trigger));
```

## First version: one module

```ts
export function parseTrigger(raw: string): Trigger {
  const colon = raw.indexOf(":");
  const kind = colon === -1 ? raw : raw.slice(0, colon);
  const value = colon === -1 ? "" : raw.slice(colon + 1);
  if (kind === "command") return { kind: "command", name: value };
  if (kind === "url") return { kind: "url", url: value };
  if (kind === "workbook") {
    const folder = value.endsWith(WORKBOOK_SUFFIX) ? value.slice(0, -WORKBOOK_SUFFIX.length) : value;
    return { kind: "workbook", path: value, folder };
  }
  return { kind: "manual" };
}
```

**Improvement:** one place, no counted offsets, every reader agrees.

## Round 1: the type in its own file

```ts
// before: deno/context.ts
export type Trigger = /* … */;

// after: deno/types/context.ts, re-exported from deno/context.ts
export type Trigger = /* … */;
```

**Improvement:** follows the types rule; move a type when you touch it.

## Round 2: a table instead of an if-chain

```ts
const READERS: TriggerReaders = {
  command: (name) => ({ kind: "command", name }),
  url: (url) => ({ kind: "url", url }),
  workbook: (path) => ({ kind: "workbook", path, folder: path.replace(/\.workbook\.md$/, "") }),
};

const isValued = (kind: string): kind is ValuedTriggerKind => Object.hasOwn(READERS, kind);

export function parseTrigger(raw: string): Trigger {
  const [, kind = "", value = ""] = /^([a-z]+):(.*)$/s.exec(raw) ?? [];
  return isValued(kind) ? READERS[kind](value) : { kind: "manual" };
}
```

**Improvement:** one row per kind; parsing is a lookup; the type guard removes the cast.

## Round 3: split instead of a regex

```ts
// before
const [, kind = "", value = ""] = /^([a-z]+):(.*)$/s.exec(raw) ?? [];

// after
const [kind, ...rest] = raw.split(":");
const value = rest.join(":"); // everything after the first colon, a URL's own colons included
```

**Improvement:** reads at a glance; the one subtlety gets a comment.

## Round 4: a written-out type instead of a computed one

```ts
// before
export type ValuedTriggerKind = Exclude<Trigger["kind"], "manual">;
export type TriggerReaders = { [K in ValuedTriggerKind]: (value: string) => Extract<Trigger, { kind: K }> };

// after
export type ManualTrigger = { kind: "manual" };
export type CommandTrigger = { kind: "command"; name: string };
export type UrlTrigger = { kind: "url"; url: string };
export type WorkbookTrigger = { kind: "workbook"; path: string; folder: string };

export type Trigger = ManualTrigger | CommandTrigger | UrlTrigger | WorkbookTrigger;

export interface TriggerReaders {
  command(name: string): CommandTrigger;
  url(url: string): UrlTrigger;
  workbook(path: string): WorkbookTrigger;
}

export type ValuedTriggerKind = keyof TriggerReaders;
```

**Improvement:** reads as plain declarations. Trade: a new kind no longer fails the table by itself;
fine for three stable kinds with a test per kind.

## End

```ts
export function parseTrigger(raw: string): Trigger {
  const [kind, ...rest] = raw.split(":");
  const value = rest.join(":"); // everything after the first colon, a URL's own colons included
  return isValued(kind) ? READERS[kind](value) : { kind: "manual" };
}
```

`lib/triggers.js` is the same, plus one line for `debug`. Tests passed unchanged after every round.

## Where it stops paying

- Table: not when a case needs its own logic.
- Regex: use one when a pattern is the point.
- Computed types: use them when the set is large or changes often.
