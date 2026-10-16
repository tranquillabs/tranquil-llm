<!-- For agents working on Tranquil's repos. Never shipped. -->

# Markup mechanics

The ways an `.svx` page silently renders wrong. Most of these fail quietly — the
build succeeds and the page looks almost right.

Config lives in `svelte.config.js`.

---

## Code fences

Shiki is configured with a fixed allowlist:

```
typescript  javascript  bash  shell  toml  json
```

plus aliases `ts → typescript`, `js → javascript`, `sh → bash`, `shell → bash`.

**Any other language — or no language — falls back to a plain escaped
`<pre><code>` with no highlighting at all.** The build does not warn. So
` ```svelte `, ` ```css `, ` ```html `, ` ```yaml `, ` ```diff ` and ` ```text `
all render as flat grey text.

If you need one of those, either accept the flat rendering deliberately or use the
nearest allowed language. ` ```txt ` for diagrams and trees is fine and used in
the ADR overview page.

Themes are `github-dark` / `github-light` with `defaultColor: false`, so
highlighting follows the site's light/dark mode through CSS variables.

---

## Callouts

Raw HTML in markdown. The blank lines are required — without them the body is not
parsed as markdown and the bold/links inside render literally:

```html
<blockquote class="callout-warn">

**Dev preview — not stable.** Body text here, with **markdown** that works.

</blockquote>
```

`callout-warn` is the only styled variant (`src/app.css`, ~line 1632): warn-toned
border, tinted background, and `strong` recoloured.

**`callout-note` has no CSS rule.** Three pages use it and get a plain blockquote.
Use `callout-warn` or a bare `>` blockquote until someone adds the styles.

A plain `>` blockquote is the right choice for a soft aside — it's styled as a
hairline-bordered panel with an accent left border.

---

## Tables

Escape pipes inside cells or the column count breaks:

```md
| `tab.waitFor(selector \| fn, opts?)` | `Promise<void>` | … |
```

Every table needs a lead-in sentence above it (Pass 3).

---

## Headings and anchors

**Heading IDs are assigned client-side.** `docs/+layout.svelte` runs a `$effect`
that scans `h2, h3` inside `.doc-body` and applies `slugify()` from
`src/lib/search/slugify.ts`:

```ts
text.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-')
```

`\w` is ASCII-only, so non-ASCII glyphs are stripped. Backticks and punctuation
in a heading vanish: `### \`context\`` → `#context`.

Consequences:

- `svelte.config.js` sets `handleMissingId: 'warn'` because the prerenderer
  cannot see IDs that don't exist until hydration. **A broken anchor will not fail
  the build.** `deno task lint:docs` is the only thing that catches it.
- Only `h2` and `h3` get IDs and TOC entries. An `h4` is unnavigable.
- **Renaming a heading breaks every inbound anchor**, including from other pages.
  Grep the slug across `src/routes/docs/` before changing heading text.

---

## Links

`trailingSlash: 'always'`. Internal links need the trailing slash or they cost a
redirect: `](../engine/)`, not `](../engine)`.

Both absolute (`/docs/guides/foo/`) and relative (`../foo/`) styles are in use,
sometimes in the same file. Prefer relative within a section, absolute across
sections; be consistent inside one page.

---

## Footnotes

`remark-footnotes` is pinned at **v2** — the last release compatible with mdsvex's
bundled legacy remark parser. Do not upgrade it; v3+ needs remark 13.

```md
Some claim.[^1]

[^1]: The source.
```

---

## Mermaid

` ```mermaid ` fences are transformed by `src/lib/remark/beautiful-mermaid.js`
into pre-rendered SVG inside a `<div class="mermaid-toggle">` with Source/Diagram
and fullscreen controls. Colours bind to `var(--color-*)` tokens, so diagrams
follow the theme. Write plain mermaid; the plugin handles the rest.

---

## Svelte blocks

No `.svx` page in the tree uses a `<script>` block or imports a component, and
none needs to. If you find yourself reaching for one, the content probably belongs
in a component under `src/lib/components/` instead.
