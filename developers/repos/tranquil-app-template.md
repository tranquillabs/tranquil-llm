<!-- For agents working on Tranquil's repos. Never shipped. -->

# tranquil-app-template (user-facing)

The template for small Tranquil "apps" (static HTML, CSS and JS that automations drive), and the
home of the design-system reference: `app/mockup.css` (tokens matching the business themes) with
`app/main-view.html` and `app/properties.html`. `deno task dev` serves `app/` with live reload
(browser-sync under Deno; see [tools/deno.md](../tools/deno.md)). `automations/open-app.js` opens the
two views into the center and right dock.

Like tranquil-examples, it is cloned by users and has no developer instruction file.
tranquil-ops-demo is built on it (an operations console used to record the website's demo videos).
