<!-- For agents working on Tranquil's repos. Never shipped. -->

# Front end

All new front-end work in Tranquil's apps uses **Svelte**, and only packages from the Svelte
packages list[^packages]. Existing UIs keep their current code until they are rewritten, which is
likely for several of them.

This covers Tranquil's apps, including new UI inside the Pulsar packages, such as the workbook
view. It doesn't cover:

- **www-tranquil,** the website. It isn't one of the apps, and follows its own rules.
- **Test fixtures that stand in for other companies' sites** (tranquil-test-suite `fixtures/`).
  They are plain HTML and JS, because they imitate how those sites behave and aren't Tranquil's
  UI.

## The stack

| For | Use |
| --- | --- |
| Components and the design system | Skeleton[^skeleton], its Svelte components. It is built on Tailwind CSS, which it requires |
| An ORM, if one is needed | Drizzle, through the Svelte CLI's `drizzle` add-on[^drizzle] |
| Markdown | mdsvex, through the Svelte CLI's `mdsvex` add-on[^mdsvex] |

More Svelte-specific packages will be added here over time.

## How to apply

- **Svelte, nothing else.** No React, Vue or other framework. Skeleton also ships React
  components; use only its Svelte ones.
- **A package not in the table above must be on the Svelte packages list** and still needs the
  person's approval, named and asked for before it is added. Nothing is installed or downloaded
  without asking first ([security-first.md](security-first.md#no-dependency-without-asking)).
- **Run the Svelte CLI and other npm tools under Deno** in Deno-only repos, never with `npx`
  ([tools/deno.md](../tools/deno.md#running-npm-tools-under-deno)).

[^packages]: Packages, Svelte, <https://svelte.dev/packages>
[^skeleton]: Skeleton, Skeleton Labs, <https://www.skeleton.dev/>
[^drizzle]: drizzle, Svelte CLI docs, <https://svelte.dev/docs/cli/drizzle>
[^mdsvex]: mdsvex, Svelte CLI docs, <https://svelte.dev/docs/cli/mdsvex>
