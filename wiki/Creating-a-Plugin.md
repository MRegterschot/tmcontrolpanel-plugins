# Creating a plugin

Run these commands from the registry root. Choose a unique slug with 3–40 lowercase
letters, digits or dashes. Native command names and first-party plugin slugs are reserved.

```bash
bun .controlpanel/packages/plugin-sdk/src/cli/main.ts init plugins/my-greeting --slug my-greeting --name "My Greeting"
```

The scaffold contains `src/index.ts`, `templates/widgets/main.hbs`,
`tmcp-plugin.json`, a README, a package file and TypeScript configuration.
The generated package file assumes an npm-published SDK; while developing in this
registry, use the checkout-backed commands below instead of running `npm install`
in the plugin directory. Root `bun run setup` supplies the SDK and TypeScript.

Edit `tmcp-plugin.json` before building:

- Set `author`, a useful `description`, and your repository URL.
- Keep the scaffold's unique slug and matching command name.
- Target SDK 2 for tabs, nested forms and selectors.
- Declare only the capabilities your plugin calls.
- Set `configSchema` defaults so a new install works without manual setup.

## Understand the entry point

```ts
import { definePlugin } from "@tmcontrolpanel/plugin-sdk";

interface Config {
  message: string;
}

export default definePlugin<Config>({
  create(ctx) {
    ctx.command("my-greeting", (_args, login) =>
      ctx.chat.sendTo(login, ctx.config().message),
    );
    return {
      start() {
        // Display UI or load plugin state here.
      },
      onConfigUpdate() {
        // Refresh UI when an admin saves the form.
      },
    };
  },
});
```

`create` registers handlers; `start` runs when the plugin is loaded.
The runtime owns registered handlers, timers and UI and cleans them up when the
plugin stops. Use `stop` for additional plugin-specific cleanup if needed.
`ctx.config()` supplies validated settings with defaults. Plugins must not import
panel internals; the panel does not execute a plugin's React components.

For a richer example, read
[`plugins/hello/src/index.ts`](https://github.com/MRegterschot/tmcontrolpanel-plugins/blob/main/plugins/hello/src/index.ts)
and its template. `ctx.on("playerConnect", ...)` handles connections,
`ctx.action("wave", ...)` handles the template's `{{action "wave"}}`, and
`ctx.storage.get/set` persists values within the plugin's server-specific namespace.

## Build your first package

```bash
bun run typecheck
bun .controlpanel/packages/plugin-sdk/src/cli/main.ts pack plugins/my-greeting
bun .controlpanel/packages/plugin-sdk/src/cli/main.ts validate plugins/my-greeting/dist/my-greeting-0.1.0.zip
```

Upload that zip privately to try it before preparing a registry release. If you
keep source in this registry, root typechecking includes `plugins/*/src`.
