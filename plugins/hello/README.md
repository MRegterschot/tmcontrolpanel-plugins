# Hello: a complete example plugin

Start here when creating a GoControlPanel plugin. This SDK 4 example includes:

- A `/hello` command and a player-connect event handler.
- A greeting widget with a clickable **Hi** action, colored by the panel theme.
- Per-player greeting counts saved in persistent plugin storage.
- A registry-owned settings form with Greeting and Widget tabs.
- Sandbox tests that exercise the packaged plugin.

The greeting is sent privately to the requesting player. The widget's total counts
greetings in the current plugin instance; each player's stored count survives reloads.

## Source tour

| File | Purpose |
|---|---|
| `tmcp-plugin.json` | Identity, version, SDK, capabilities, command and form schema |
| `src/index.ts` | Lifecycle, command/event/action handlers, storage and UI |
| `templates/widgets/greeting.hbs` | Handlebars manialink template |
| `plugin.json` | Marketplace tags |
| `versions/` | Immutable packages and checksum descriptors |
| `../../test/hello-plugin.test.ts` | Tests against the real plugin sandbox |

The plugin declares only `ui`, `chat:send` and `storage`. Plugins run in a sandbox;
use `ctx` services rather than Node.js, filesystem access, `fetch`, or package imports
that assume those APIs exist at runtime.

## Build and try it

From the registry root, after following the setup in `wiki/Getting-Started.md`:

```bash
bun .controlpanel/packages/plugin-sdk/src/cli/main.ts pack plugins/hello
bun .controlpanel/packages/plugin-sdk/src/cli/main.ts validate plugins/hello/dist/hello-1.2.0.zip
bun run test -- test/hello-plugin.test.ts
```

On the panel's **Plugins** page, upload the zip, review the requested permissions,
then install it on a server you administer. Type `/hello` in game or click **Hi**.
Change the greeting and show/hide the widget through **Configure**.

For a new plugin, scaffold a fresh slug rather than publishing your changes as
`hello`; see the registry's [creation guide](../../wiki/Creating-a-Plugin.md).
For updates to this example, raise its version before packaging for publication.
Never replace an archive already in `versions/`.
