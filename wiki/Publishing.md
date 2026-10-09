# Publishing a plugin

Registry versions are immutable. Any change to code, templates, the manifest or
config form needs a new semantic version. The original archive and descriptor stay
available so existing installs can continue using their pinned version.

## Plugin source kept in this registry

From the registry root, after raising the plugin version:

```bash
bun run build --publish --plugins=my-greeting
bun run check
```

Include source, templates, README, tests, `tmcp-plugin.json`, the new zip and its
checksum descriptor in `plugins/my-greeting/versions/`. Optional `plugin.json`
contains marketplace tags and screenshots.

Open a pull request to the registry. Review covers capabilities, readable bundled
code, templates, behavior and checksums. Merging to `main` runs the **Publish
marketplace** workflow, which publishes the index and packages through GitHub Pages.
An admin installs the plugin or accepts an update from the panel's Plugins page.

Use a selected build (`--plugins=my-greeting`) when releasing one plugin;
`--publish` without a selection tries to publish every source plugin and refuses
already existing version descriptors.

## Plugin source kept in another repository

1. Build and validate the zip using the checkout-backed SDK CLI.
2. Attach it to a public release of your plugin repository.
3. Add `plugins/<slug>/versions/<version>.json` to a registry PR:

```json
{
  "url": "https://github.com/you/my-plugin/releases/download/v0.1.0/my-plugin-0.1.0.zip",
  "sha256": "<checksum printed by pack>",
  "publishedAt": "<UTC ISO timestamp for this release>",
  "changelog": "Initial release"
}
```

The registry build downloads the release, checks its checksum and manifest, then
copies it to the registry site's origin. Panels download the copied package, not
arbitrary URLs from the plugin. The first version claims the slug; later versions
must keep its author identity.

## Compatibility and withdrawal

SDK 2 forms require SDK 2 in both the panel and GBX service, and theme colors
require SDK 4. A plugin targeting a
newer SDK is not an installable update on older panels. Existing installs stay pinned
until an admin selects Update and accepts any additional capabilities.

To withdraw a broken or unsafe version, add `"yanked": true` and a `yankReason` to
its descriptor. Do not delete or replace archives. Services check the registry and
disable withdrawn versions, while the panel blocks new installs of them.
