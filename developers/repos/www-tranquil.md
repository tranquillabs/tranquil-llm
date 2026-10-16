<!-- For agents working on Tranquil's repos. Never shipped. -->

# www-tranquil

The Tranquil website and docs (`www.tranquillabs.dev`): marketing pages, the docs (guides, ADRs,
delivery notes), release notes, and a private analytics dashboard. `www-tranquil` is the repo name;
**tranquil** is the brand shown in the UI. Repo: <https://github.com/tranquillabs/www-tranquil>
(private), branch `main`. **Every push to `main` publishes** (Deno Deploy).

How docs, ADRs and notes are written: [rules/docs.md](../rules/docs.md) and the `tranquil-docs`
skill.

## Stack

- **SvelteKit 2** with `@deno/svelte-adapter`, fully prerendered (`prerender = true`,
  `trailingSlash = 'always'`); the adapter wraps the pages in a Deno server for Deno Deploy (see
  `docs/deploy.md`).
- **Svelte 5 runes** (`$state`, `$derived`, `$props`, `$effect`) throughout.
- **Tailwind v4** through `@tailwindcss/vite`; config lives in `src/app.css` (no
  `tailwind.config.js`).
- **Flowbite Svelte v2** (`2.0.0-next`) for component primitives.
- **@fontsource** self-hosted fonts (JetBrains Mono, IBM Plex Sans). No requests to Google Fonts.
- **Deno 2.8** toolchain. No Node, npm or yarn at the command line.

## Setup and commands

Only Deno 2.8+ is needed.

```sh
git clone https://github.com/tranquillabs/www-tranquil.git && cd www-tranquil
deno install      # node_modules from package.json + deno.lock
deno task dev     # http://localhost:5173
```

| Task | What it does |
| --- | --- |
| `deno task dev` | Vite dev server |
| `deno task build` | static build to `build/` |
| `deno task preview` | serve the build |
| `deno task check` | `svelte-kit sync` + `svelte-check` (types); must report 0 errors |
| `deno task lint:docs` | the docs linter (`--path <page>` for one page) |
| `deno task screens` | screenshot pipeline (below) |
| `deno task migrate:docs` | rewrites old `/docs/…` URLs (`--rewrite <file>`, `--unlink-drafts`) |
| `deno task toot` | announce a published release on Mastodon |

- `deno.json` sets `nodeModulesDir: "manual"` and `nodeModulesLinker: "hoisted"`; `deno.lock` is the
  lockfile. `package.json` lists dependencies, but its npm scripts are not the entry point.
- `node_modules/`, `.svelte-kit/` and `build/` are regenerated. If Vite misbehaves, delete
  `node_modules` and `.svelte-kit` and run `deno install` again. `deno install --frozen` (or
  `deno ci`) checks the lockfile.

## Structure

```text
src/
  app.html     <html> default attributes + the inline pre-paint theme script
  app.css      Tailwind + Flowbite directives, @theme tokens, all bespoke CSS
  routes/      +layout.svelte (imports app.css, calls bindTheme + bindAnalytics), pages
               api/hit/ (analytics collector) and stats/ (dashboard): prerender = false
               docs/ (every doc page; drafts/ is dev-only), releases.json/ (feed for toot)
  lib/
    components/   home2/ is the homepage
    data/         docs.ts (the docs registry), releases.ts, home2/, other page data
    stores/       theme.svelte.ts, analytics.svelte.ts
    server/       kv.ts, analytics.ts, deno-kv.d.ts
static/        favicon, manifest, robots.txt, screens/ (generated)
media/screens/ screenshot sources (committed, never served)
```

## Docs

- Every doc serves at `/docs/<slug>/` (flat slugs, no category segments). The sidebar opens with
  ungrouped links (**Overview** at `/docs/`, then **Philosophy**), then plain group labels (Getting
  started, Core concepts, How to, Development), with one collapsible folder, **Decisions** (the
  ADRs at `/docs/adr-NNNN-…/`). Groups marked `draft: true` show only in dev.
- `src/lib/data/docs.ts` drives the sidebar, pager, breadcrumb, search manifest, sitemap and
  `lint:docs`.
- `drafts/` holds dev-only pages (delivery notes, the Engine page, older overviews), guarded by
  `!dev → error(404)` in `docs/drafts/+layout.ts`. Published pages must not link into it.
- `lint:docs` enforces the layout: published pages flat (`nested-slug`), drafts in a draft group
  (`draft-group`), no links from published pages into `drafts/` (`draft-link`), and no hand-written
  "Next:" lines (`hand-next`; the pager follows sidebar order). It is deliberately not part of
  `deno task check`.
- Old docs URLs 404 (clean breaks, no redirects).

## Homepage

- The homepage (`/`) is built from `src/lib/components/home2/`, data in `src/lib/data/home2/`,
  styles in the `home v2` block of `app.css`. **Design and copy rationale, verified product claims
  and open items are in `docs/homepage-v2.md`**; the source files carry no explanatory comments by
  design. Copy describes the shipped product. The proof section is commented out because its
  testimonials are fictional.
- `HomeHeader` (sticky, pinned to `--sitenav-h`) is the header on every page.
- The previous homepage is archived at `/archive/home-v1/`, dev-only (same guard as drafts). Its
  copy describes a hosted CLI that doesn't exist; reference its layout, not its claims.
- **Screenshots:** `deno task screens` (`scripts/optimize-screenshots.ts`) turns sources in
  `media/screens/` into responsive WebP in `static/screens/` at 900/1600/2400 wide, light and dark.
  The widths must match `SHOT_WIDTHS` in `HomeFeatures.svelte`. It won't upscale, so the markup
  derives `srcset` from each capture's real width.

## Theming

All colors are **OKLCH custom properties** in the `@theme` block of `src/app.css`; components use
`var(--color-*)` (bg, bg-2/3, line, line-2, fg, fg-dim, fg-dimmer, accent, accent-2, warn, danger,
link, term-bg, glow). There is almost no hardcoded hex.

Three switches are attributes on `<html>`, each with `:root[data-*]` overrides in `app.css`:

- `data-accent`: `green` (default), `amber`, `magenta`, `cyan`, `paper`;
- `data-density`: `compact`, `comfortable` (default), `roomy` (drives `--spacing-row`);
- `data-mode`: `dark` (default), `light`.

- **Light/dark** keys off the `.dark` class on `<html>` (required by Flowbite v2 and
  `@custom-variant dark`). Dark is the default; light is a `:root:not(.dark)` block.
- **State:** `src/lib/stores/theme.svelte.ts` exports a `$state` `theme = { accent, density, mode }`
  and `bindTheme()`, called once in `+layout.svelte`. Its `$effect` writes the attributes, toggles
  `.dark`, syncs `<meta name="theme-color">`, and persists to `localStorage['tranquil.theme.v2']`.
- **Defaults are dark and green for everyone**; first-time visitors do not follow
  `prefers-color-scheme`.
- **The first run of the effect is deliberately not persisted.** That run applies defaults, not a
  choice; persisting it would pin every visitor to the default. An earlier version did exactly that
  and the storage key had to be retired (`tranquil.theme` → `.v2`) to release them.
- **The storage key appears in three places** that must agree: `theme.svelte.ts`, the pre-paint
  script in `src/app.html`, and the footer of `ThemePanel.svelte`.
- **Anti-FOUC:** an inline, synchronous script in `src/app.html` applies mode, accent and density
  before hydration. Anything that must be right before first paint belongs there (the homepage
  screenshots swap in CSS off `.dark` for this reason).
- **UI:** `ThemePanel.svelte` (a Flowbite `Drawer`, `dismissable={false}`) is opened by the "theme"
  text button in `home2/HomeHeader.svelte`, its single mount. Don't add a second trigger.

## Analytics

No third-party analytics. `src/lib/stores/analytics.svelte.ts` beacons `{path, referrer}` to
`POST /api/hit` on hydration and each navigation; the endpoint (always 204) writes day-bucketed
counters to Deno KV. No cookies; raw IP and UA are never stored (a daily-rotating salted hash counts
uniques; GPC/DNT and bots are dropped). Dashboard: `/stats/?key=<ANALYTICS_STATS_KEY>`, 404 without
the key outside dev. Secrets `ANALYTICS_SECRET` and `ANALYTICS_STATS_KEY` live in the Deploy
console. Details: `docs/analytics.md`.

## Releases and syndication

Release notes and their draft mechanism: [rules/docs.md](../rules/docs.md#release-notes).
`scripts/toot.ts` (`deno task toot`) announces published releases on Mastodon, run by hand once a
release is live. It reads the prerendered `/releases.json` feed (the `releases` module needs Vite to
resolve). Ledger: `data/syndicated.json`. See `docs/syndication.md`.

## Conventions

- Color only through `var(--color-*)` tokens; add or override tokens instead of hardcoding.
- Monospace body type; square corners everywhere (`rounded-none` over Flowbite's defaults).
- Component styling is hand-written CSS in `app.css`, not utility soup. Flowbite components are
  themed through wrapper classes and ARIA-role selectors, not their internal class names.
- Reference assets through `$app/paths` `base`, never a hardcoded `/`.

## Gotchas

- **Vite plugin order:** `tailwindcss()` before `sveltekit()` in `vite.config.ts`, or `@theme`
  tokens inside Svelte `<style>` break.
- **Vite is pinned to 7.** Vite 8's bundler crashes `@tailwindcss/vite`'s native plugin on Deno
  Deploy's linux-x64 build; `@sveltejs/vite-plugin-svelte` stays at `^6` to match (`docs/deploy.md`).
- **Don't name classes into Tailwind's utility namespace.** Tailwind generates any utility whose
  name appears in source: a class `pl-row` matched `--spacing-row` and got an unexplained
  `padding-left`. Shapes like `p-* pl-* m-* w-* h-* gap-* text-* bg-*` are affected; the `tc-*`,
  `sec-*`, `consult-*`, `prod-*` prefixes are safe. To find such a rule, grep the built CSS
  (`.svelte-kit/output/client/_app/immutable/assets/*.css`), not `app.css`.
- **`.dark` is load-bearing** for Flowbite: without it components render light.
- **`nodeModulesLinker: "hoisted"` is required.** The `isolated` default breaks Vite's
  filesystem-walking plugins (Tailwind `@source`, Svelte resolution, SvelteKit synthesis).
- **`$effect` runs only in component context**, which is why theme syncing lives in `bindTheme()`
  called from `+layout.svelte`.
- **Deno KV needs `"unstable": ["kv"]`** in `deno.json` (a dev server started before that lacks KV;
  restart it). svelte-check has no Deno types, so `src/lib/server/deno-kv.d.ts` declares the minimal
  `Deno` KV surface; don't add full Deno type packages (they collide with the DOM lib).
- **Docs titles prerender wrong.** The docs layout derives the title from `currentSlug`, which
  doesn't resolve during SSR, so every docs page prerenders as "Docs" and gets its real title after
  hydration.

## Health check

`deno task check` (0 errors) and `deno task build` (succeeds).
