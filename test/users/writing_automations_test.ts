// Keeps the automation guide honest against the SDK it describes (ADR-0026, ADR-0029). Tranquil
// publishes users/writing-automations.md to ~/.tranquil/llm/, and every automation's first line
// points LLMs there. The guide must mention the API they use, list exactly the SDK's error codes,
// and every TypeScript example must start with that pointer and type-check against the SDK, with
// no `dom` lib, as scripts get.
//
// Where the guide and the SDK are comes from deno.json: `tranquil-llm/` is this repo, and
// `tranquil/automation` is the SDK in the sibling tranquil-automations repo.
import { assert, assertEquals } from "@std/assert";
import { fromFileUrl } from "@std/path";

const CONFIG = fromFileUrl(import.meta.resolve("tranquil-llm/deno.json"));
const SDK = fromFileUrl(import.meta.resolve("tranquil/automation"));
const POINTER = "// Tranquil automation. Rules for writing and changing it: ~/.tranquil/llm/writing-automations.md";

if (!(await Deno.stat(SDK).catch(() => null))) {
  throw new Error(`These tests check the guide against the SDK at ${SDK}. Clone tranquil-automations next to tranquil-llm.`);
}
const guide = await Deno.readTextFile(new URL(import.meta.resolve("tranquil-llm/users/writing-automations.md")));

// Type-checks TypeScript sources with this repo's config: its import map points at the SDK, and its
// compiler options leave out the `dom` lib.
async function typeCheck(sources: string[]): Promise<{ ok: boolean; errors: string }> {
  const dir = await Deno.makeTempDir({ prefix: "writing-automations-" });
  try {
    const files = sources.map((_, i) => `${dir}/example-${i + 1}.ts`);
    await Promise.all(sources.map((code, i) => Deno.writeTextFile(files[i], code)));
    const out = await new Deno.Command(Deno.execPath(), {
      args: ["check", "--quiet", "--config", CONFIG, ...files],
      stdout: "piped",
      stderr: "piped",
    }).output();
    return { ok: out.success, errors: new TextDecoder().decode(out.stderr) };
  } finally {
    await Deno.remove(dir, { recursive: true });
  }
}

Deno.test("the guide mentions the SDK form methods, commands and core exports", () => {
  const required = [
    "tabs", "ui", "files", "context", "FieldError", "Frame",
    "fields", "fill", "clear", "upload", "click", "press", "frame", "evaluate", "waitFor",
    "fieldsOf", "fieldOf", "checkTargets", "clickables", "alternates", "within", "{ text:",
    "SDK: Check Custom Parts", "SDK: Map Custom Parts", "useCustomParts", "CustomPartsMap",
    "SDK: Run Automation", "Runs panel",
    "the Tranquil Skill", "Before you write", "Ask, don't assume", "recommended answer", "confirm",
    "deno check --config ~/.tranquil/automations/deno.json", POINTER,
    "text(", "ui.confirm", "context.result", "sites=", "submit", "f.empty",
  ];
  assertEquals(required.filter((word) => !guide.includes(word)), [], "the guide is missing these");
});

Deno.test("the guide's error table lists exactly the SDK's error codes", async () => {
  // Rows of the table whose header starts `| Code |`.
  const table = guide.slice(guide.indexOf("| Code |")).split("\n\n")[0];
  const codes = [...table.matchAll(/^\| `([a-z_]+)` \|/gm)].map((m) => m[1]);
  assert(codes.length > 0, "found the error table");
  // An object literal checked with `satisfies Record<ErrorCode, true>` fails on a missing code and
  // on one the SDK does not have.
  const check = [
    `import type { ErrorCode } from "tranquil/automation";`,
    `export const codes = { ${codes.map((c) => `${c}: true`).join(", ")} } satisfies Record<ErrorCode, true>;`,
  ].join("\n");
  const { ok, errors } = await typeCheck([check]);
  assert(ok, `the error table does not match the SDK's ErrorCode:\n${errors}`);
});

Deno.test("every TypeScript example starts with the pointer and type-checks against the SDK", async () => {
  const blocks = [...guide.matchAll(/```ts\n([\s\S]*?)```/g)].map((m) => m[1]);
  assert(blocks.length >= 3, "found the examples");
  for (const code of blocks) {
    assert(code.startsWith(POINTER + "\n"), `an example does not start with the pointer:\n${code.slice(0, 120)}`);
  }
  const { ok, errors } = await typeCheck(blocks);
  assert(ok, `guide examples failed to type-check:\n${errors}`);
});
