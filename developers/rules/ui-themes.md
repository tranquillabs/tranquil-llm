<!-- For agents working on Tranquil's repos. Never shipped. -->

# UI and themes

## Style the business themes

The active UI themes are **always `tranquil-business-dark` and `tranquil-business-light`** (see
`core.themes` in `~/.tranquil/config.cson`). `tranquil-theme-dark`/`-light` exist but are not what
runs; editing them has no visible effect.

- Keep the two business themes in sync. They share their partials; `styles/colors.less` is the
  per-theme file, and a few partials differ on purpose (`fonts.less`, `terminal.less`,
  `tranquil-browser.less`). `diff -r` the two `styles/` folders before copying one across. Styles
  are scoped with `@{theme-scope}`.
- When the old themes are touched too (for example a browser toolbar change), update both of their
  `tranquil-browser.less` files: each uses different color variables.
- Read the theme development guide before theme work: www-tranquil
  `drafts/themes/theme-development` (companion: `drafts/themes/settings-ui-widgets`). Its key
  points:
  - the theme class sits on `atom-workspace`, not `<body>`, so body-level elements (tooltips) need
    global rules;
  - no `!important`: theme stylesheets outrank packages at equal specificity;
  - package stylesheets `@import "ui-variables"` and use standard variables; theme code uses
    `colors.less` tokens;
  - fonts load through `atom://` (CSP blocks `data:` fonts).

## Reuse the design-system widgets

Don't hand-roll checkbox, input or button styles. The sources of truth:

- tranquil-app-template `app/mockup.css` (tokens mirroring the theme colors, `.form-input`,
  `.form-select`, `.form-check`, `.btn`, `.switch`), referenced by `app/main-view.html`;
- the browser find bar (`tranquil-browser/lib/browser-find-item.js`, geometry in
  `styles/tranquil-browser.less`, colors in each theme).

Canonical specs:

- **Inputs:** background `@app-bg`, border `1px @border-strong`, radius 6px, padding about
  `7px 10px`; focus gives an `@accent` border and `0 0 0 3px fade(@accent, 16%)` shadow.
- **Checkboxes:** an `appearance: none` 16px box (3px radius); when checked, fill `@accent` and draw
  the check as a `background-image` inline SVG. `<input>` never paints `::before`/`::after` in
  Chromium, though `getComputedStyle` still reports the content. Encode `#` as `%23` and build the
  URI in a variable. Radios can use native `accent-color`.
- **Buttons:** radius 6px, weight 500, `1px @border-strong` border, `@surface-active` fill; primary
  is `@accent` with `@text-inverse`.

## Settings panel rows

Every item in the Tranquil settings tab sits on its own line, laid out like the stock ones (label,
then control, then an optional secondary row, all left-aligned). settings-view nests `.controls`
inside `.controls`, and the business themes lay out `.control-group` as a flex column ordered by
`order:`. Append a custom secondary row to `el.closest('.control-group')` with `order: 2` in both
business themes' `settings.less`; never beside the inner `.controls`. Match 34px field height, 22em
width, 13px font. Precedents: the User-Agent "Get current UA" row, Toast Duration's Test button.

## Rendering glitches

- **SVG icons used as `<img>` need intrinsic `width`/`height` attributes.** Without them the image
  renders at about 300×150 until the package stylesheet loads, so it flashes huge on reload.
- **Stale composited layers.** An owned panel with its own GPU layer (`position: fixed` overlays,
  or `overflow` scrolling) can go stale on a dock resize, reload or re-render; the signature is
  that toggling DevTools fixes it. Fix: a `ResizeObserver` plus a one-frame `translateZ(0)`
  `forceRepaint()` on resize and after render (`folder-counts.js`, `vertical-tabs-view.js`).
  Removing the layer promotion avoids the whole class.

## Dev app name

In dev, the macOS menu bar and Dock show "Electron", and this cannot be fixed in dev: plist
patches, a unique bundle id, re-signing and LaunchServices refreshes were all disproven, and
programmatic name readouts report "Tranquil" while the menu bar shows "Electron". Only the icon is
fixable (`scripts/dev.js` `patchMacAppIcon()`). The name is right only in packaged builds (ADR-0020).
