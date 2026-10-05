# Plugin developer wiki

Build, test and publish plugins for GoControlPanel using the TypeScript plugin SDK.
Plugin source, templates, config forms and immutable packages live in this registry.
The panel provides the SDK, sandbox runtime and management UI.

Begin with the working [Hello example](https://github.com/MRegterschot/tmcontrolpanel-plugins/tree/main/plugins/hello):
it demonstrates commands, events, clickable UI, persistent storage and a settings form.

1. [Getting started](https://github.com/MRegterschot/tmcontrolpanel-plugins/wiki/Getting-Started): prepare the SDK and registry checkout.
2. [Creating a plugin](https://github.com/MRegterschot/tmcontrolpanel-plugins/wiki/Creating-a-Plugin): scaffold a new plugin and understand its files.
3. [Developing and testing](https://github.com/MRegterschot/tmcontrolpanel-plugins/wiki/Developing-and-Testing): build, upload, run sandbox tests and iterate.
4. [Configuration forms](https://github.com/MRegterschot/tmcontrolpanel-plugins/wiki/Configuration-Forms): describe fields, tabs, selectors and imports in the manifest.
5. [Publishing](https://github.com/MRegterschot/tmcontrolpanel-plugins/wiki/Publishing): submit a reviewed, immutable plugin version.

For the full host API, events and capabilities, see the
[SDK reference](https://github.com/MRegterschot/gocontrolpanel/blob/refactor/monorepo-gbx-service/docs/plugin-sdk.md).

## Maintaining this wiki

The reviewed source of these pages is the registry's `wiki/` directory. Edit those
files and run `bun run wiki:publish` to copy them to GitHub's wiki repository.
That command preserves other wiki pages, commits changed documentation and pushes it.
GitHub requires an initial wiki page to be created on its website before a wiki can
be cloned or pushed. Local SDK/dependency links stay ignored and are never wiki content.
