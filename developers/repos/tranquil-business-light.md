<!-- For agents working on Tranquil's repos. Never shipped. -->

# tranquil-business-light

The active light UI theme, and the one to style (see [rules/ui-themes.md](../rules/ui-themes.md)).
It shares its partials with tranquil-business-dark: `styles/colors.less` is the per-theme file,
and `fonts.less` (the package name in its `atom://` URL), `terminal.less` and
`tranquil-browser.less` (dark-only icon recoloring) differ on purpose. Make every structural change
in both themes; `diff -r` the two `styles/` folders before copying a partial across. It exports
`ui-variables` (`styles/ui-variables.less`) for package stylesheets.
