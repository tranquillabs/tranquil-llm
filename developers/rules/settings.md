<!-- For agents working on Tranquil's repos. Never shipped. -->

# Package settings

- **Declare settings in `package.json` `configSchema`** (title, description, type and default for
  each), the Pulsar convention its bundled packages follow. Pulsar registers them when the package
  loads, before activation. Not in a main-module `config` object.
- **Code never spells a key out.** Each package's `lib/settings.js` builds keys from `package.json`
  (`setting("denoPath")` gives `tranquil-automations.denoPath`) and throws on an undeclared one.
- **App-wide `tranquil.*` settings** are the exception: tranquil-config owns and declares them
  (`TRANQUIL_SETTINGS`), and other packages name the ones they read once, in their `settings.js`.
- **No `enum` for an editable choice.** Pulsar's config rejects out-of-enum values and settings-view
  renders an enum as a closed `<select>`. An editable dropdown (the User-Agent presets) is a plain
  `string` setting with our own combobox DOM.

**Why:** a hardcoded key string drifts from the schema without any error; building keys from the
schema makes an undeclared key fail loudly.

For laying out custom rows in the settings panel, see [ui-themes.md](ui-themes.md).
