// The repo's conventions (README, ADR-0029): two audiences in two folders, topic-named files with
// no AGENTS.md or CLAUDE.md, a header line naming the audience on every file, and every developer
// file reachable from developers/index.md.
import { assert, assertEquals } from "@std/assert";
import { walk } from "@std/fs/walk";
import { dirname, fromFileUrl, join, relative, resolve } from "@std/path";

const root = fromFileUrl(import.meta.resolve("tranquil-llm/"));
export const HEADERS = {
  developers: "<!-- For agents working on Tranquil's repos. Never shipped. -->",
  users:
    "<!-- User guide: shipped with Tranquil and published to ~/.tranquil/llm/ for users' LLMs. Not instructions for working on any repo. -->",
};

async function markdown(dir: string): Promise<string[]> {
  const out: string[] = [];
  for await (const e of walk(join(root, dir), { includeDirs: false, exts: [".md"] })) out.push(e.path);
  return out.sort();
}

// The header is the first line, or the first line after a skill's frontmatter.
function headerOf(text: string): string {
  const body = text.startsWith("---\n") ? text.slice(text.indexOf("\n---\n", 4) + 5) : text;
  return body.replace(/^\n+/, "").split("\n")[0];
}

Deno.test("only the two audience folders hold LLM files", async () => {
  const stray = (await markdown(".")).map((p) => relative(root, p))
    .filter((p) => !/^(developers|users)\//.test(p) && !["README.md", "LICENSE.md"].includes(p));
  assertEquals(stray, []);
});

Deno.test("no file is named AGENTS.md or CLAUDE.md", async () => {
  const named = (await markdown(".")).filter((p) => /(^|\/)(AGENTS|CLAUDE)\.md$/i.test(p));
  assertEquals(named.map((p) => relative(root, p)), []);
});

Deno.test("every file opens with its audience's header line", async () => {
  const wrong: string[] = [];
  for (const [folder, header] of Object.entries(HEADERS)) {
    for (const p of await markdown(folder)) {
      if (headerOf(await Deno.readTextFile(p)) !== header) wrong.push(relative(root, p));
    }
  }
  assertEquals(wrong, [], "these files lack their header line");
});

Deno.test("every developer file is reachable from developers/index.md", async () => {
  const index = join(root, "developers", "index.md");
  const seen = new Set<string>([index]);
  const queue = [index];
  while (queue.length) {
    const file = queue.pop()!;
    const text = await Deno.readTextFile(file);
    for (const m of text.matchAll(/\]\(([^)#\s]+)(#[^)]*)?\)/g)) {
      if (/^[a-z]+:/.test(m[1])) continue;
      const target = resolve(dirname(file), m[1]);
      const stat = await Deno.stat(target).catch(() => null);
      assert(stat, `${relative(root, file)} links to a missing ${m[1]}`);
      if (stat.isDirectory) continue;
      if (target.endsWith(".md") && target.startsWith(join(root, "developers")) && !seen.has(target)) {
        seen.add(target);
        queue.push(target);
      }
    }
  }
  const unreached = (await markdown("developers")).filter((p) => !seen.has(p) && !p.includes("/skills/"));
  assertEquals(unreached.map((p) => relative(root, p)), [], "link these from developers/index.md");
});
