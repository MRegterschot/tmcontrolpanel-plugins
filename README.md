# GoControlPanel plugins

The plugin marketplace of [GoControlPanel](https://github.com/MRegterschot/gocontrolpanel). Every panel,
self-hosted ones included, reads the index published from this repository and installs plugins from it.

- **Panels read** `https://mregterschot.github.io/tmcontrolpanel-plugins/index.json`, built by the
  *Publish marketplace* workflow on every push to `main`.
- **Pull requests are the review.** A plugin version is public once its pull request is merged.
- **Packages are pinned.** Every version is pinned by sha256 and copied to the site, and panels only
  download from the site. A replaced release asset fails the build instead of reaching panels.

## Publishing a plugin

1. Build the package with the SDK (see the
   [plugin SDK guide](https://github.com/MRegterschot/gocontrolpanel/blob/master/docs/plugin-sdk.md)):

   ```bash
   tmcp-plugin pack            # dist/<slug>-<version>.zip, prints its sha256
   ```

2. Attach the zip to a release of your plugin's repository.
3. Open a pull request that adds `plugins/<slug>/versions/<version>.json`:

   ```json
   {
     "url": "https://github.com/you/your-plugin/releases/download/v1.0.0/your-plugin-1.0.0.zip",
     "sha256": "<printed by tmcp-plugin pack>",
     "publishedAt": "2026-10-04T12:00:00Z",
     "changelog": "What changed in this version"
   }
   ```

   Optionally add `plugins/<slug>/plugin.json` with `tags` and `screenshots` (images in the same
   folder). Name, description, author and links come from the package's `tmcp-plugin.json`.

4. The *Check plugins* workflow downloads the package, checks the sha256 and validates it the way a
   panel does. A maintainer then reviews the code.

The first version of a slug claims it. Later versions of that slug are only accepted from the same author.

## Reviewing

Packages contain one unminified JavaScript bundle (`index.js`), the manialink templates and the
manifest. Before merging, check:

- **Capabilities.** Does the plugin need every one it declares? `players:moderate` and `mode:control`
  need a reason. `http:<host>` hosts must be the plugin's own service or a well-known API.
- **Code.** `index.js` should match the linked source. Look for obfuscated code, `eval`/`Function`,
  and data sent to hosts the README doesn't mention.
- **Templates.** Manialinks run ManiaScript on players' game clients. Look for `OpenLink`, HTTP
  requests from ManiaScript (`Http.CreateGet`/`CreatePost`), and anything that tracks players.
- **Behaviour.** Install the version on a test server (Plugins page → upload the zip) and use it.

## Withdrawing a version

Set `"yanked": true` and a `"yankReason"` in the version file instead of deleting it. Panels check the
index every 30 minutes. They turn the version off on every server that runs it, tell the server's
admins why, and refuse to install it again. To take down a whole plugin, yank every version.

## Reporting a plugin

Use the *Report a plugin* issue form. Panels link to it from every plugin page.

## Developing first-party plugins

All ten first-party plugins live here in `plugins/<slug>` alongside their registry
metadata and immutable version archives. The panel repository contains the SDK,
sandbox runtime, and management/settings UI.

Clone the panel into `.controlpanel` (or link an existing checkout there), check out
`refactor/monorepo-gbx-service` or a later branch containing the SDK, and run:

```bash
cd .controlpanel
bun install --frozen-lockfile
DB=mysql bun run generate
cd ..
bun run setup
bun run check
```

`setup` links this repository's tooling dependencies to the panel checkout. CI does
the same with `TMCONTROLPANEL_REF`, which selects the panel branch to test against.
The registry owns plugin unit tests, sandbox behavior tests, and template snapshots;
its tests use the generic sandbox harness from the panel checkout.

To change a first-party plugin, edit its source/templates and increase the version
in `tmcp-plugin.json`. Then run:

```bash
bun run build --publish
bun run check
bun run site
```

`--publish` writes a new archive and checksum descriptor under `versions/`, ready
for review. It refuses to overwrite existing descriptors. The normal build verifies
that current source matches the published checksum. Never replace an existing
version archive: panels retain their copies, and registry versions are immutable.

Open a pull request with the source, tests, and new package/version descriptor.
Merging to `main` publishes the index and packages to GitHub Pages. No panel release
is needed to publish plugin updates. The GBX service imports first-party packages
from the registry at startup; existing installs keep their settings and version
until an admin updates them through the panel.
