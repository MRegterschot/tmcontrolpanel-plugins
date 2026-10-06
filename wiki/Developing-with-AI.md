# Developing plugins with AI

An AI coding assistant can help scaffold a plugin, implement SDK handlers, write
manialink templates and test behavior. Give it access to this repository and a
compatible SDK checkout so it can verify its work against real code.

## Prepare the workspace

Follow [Getting started](https://github.com/MRegterschot/tmcontrolpanel-plugins/wiki/Getting-Started)
to set up `.controlpanel`, link dependencies and check the Hello example. Open
the registry root as the assistant's workspace.

The root [AGENTS.md](https://github.com/MRegterschot/tmcontrolpanel-plugins/blob/main/AGENTS.md)
contains repository instructions for coding agents: where to find APIs, how to
build and test, and how to preserve immutable releases. Ask your assistant to read
it before making changes. If your tool does not load `AGENTS.md` automatically,
attach it or explicitly include its contents with your request.

Useful context to point the assistant at:

- `plugins/hello/`: a small plugin with a command, event, widget, storage and config form.
- `test/hello-plugin.test.ts` and `test/fakes/harness.ts`: tests of a packaged plugin.
- `.controlpanel/docs/plugin-sdk.md` and `.controlpanel/packages/plugin-sdk/src`:
  the API reference and types for your actual SDK checkout.
- The existing plugin closest to your feature, for example a leaderboard widget
  or the match plugin for more complex behavior.

If you use a chat assistant without filesystem access, provide the relevant files
and sanitized command output yourself. It cannot verify local builds or run tests
without tools connected to your workspace.

## Describe the behavior you want

Specify the slug, supported game modes, commands/events, who may use them, settings,
UI behavior and any persistent data. State what should happen when settings change
or the plugin stops. For an external API, supply its contract and explain what data
may be sent; keep real credentials out of prompts and fixtures.

For example, use this as a first implementation request:

```text
Read AGENTS.md and the Hello plugin and its tests. Create a new plugin in
plugins/my-greeting with slug and command my-greeting, targeting SDK 2.

When a player joins or types /my-greeting, send only that player a configurable
greeting containing their nickname. Add greeting (string, default "Welcome")
and greetOnJoin (boolean, default true) settings. Everyone may use the command.
Apply config changes without reinstalling. No widget, storage or external HTTP
is needed. Declare only the capabilities used and document them in the README.

Use the checked-out SDK types to verify API signatures. Add packaged sandbox
tests for the command, joining with greetOnJoin on/off, and config updates.
Run typechecking and those tests, then pack and validate a private test zip.
Report the archive path, results and any manual checks still needed.
Keep this as a private test package for now.
```

Provide your author name and repository URL for the manifest, and adjust the
requirements to your plugin. For a larger feature, ask the assistant to identify
the SDK calls and files it will change first, then implement one testable behavior
at a time. If an API is missing, have it explain the limitation using SDK types
instead of inventing a method or modifying panel internals to make a plugin compile.

## Iterate with evidence

Review the diff and run the same commands the assistant reports. From the registry
root, for the example above:

```bash
bun run typecheck
bun run test -- test/my-greeting.test.ts
bun .controlpanel/packages/plugin-sdk/src/cli/main.ts pack plugins/my-greeting
bun .controlpanel/packages/plugin-sdk/src/cli/main.ts validate plugins/my-greeting/dist/my-greeting-0.1.0.zip
```

Use the version in your manifest for the zip filename. A full `bun run check` also
compares source against registry archives, so it requires a prepared local registry
version; private development can use the targeted checks above first.

Upload the zip on the panel's Plugins page and exercise it on a test server.
For a first-party plugin, use the local registry and Update flow instead of a
private upload, as explained in
[Developing and testing](https://github.com/MRegterschot/tmcontrolpanel-plugins/wiki/Developing-and-Testing).
Check commands, config changes, enabling/disabling and any UI in game. Sandbox
tests cannot establish that the final layout looks right or gameplay feels right.

For a bug, give the assistant reproduction steps, expected versus actual behavior,
and relevant sanitized GBX logs. A useful follow-up is:

```text
With greetOnJoin=false, joining still sends a greeting. Reproduce this in the
sandbox test, fix the handler using the current SDK, and rerun the relevant tests
and typecheck. Explain the cause and report exactly which checks passed.
```

Before accepting a change, check that permissions match the feature, privileged
actions validate the caller, settings/storage remain compatible, and the README
explains commands and external data transfers. Review new tests for meaningful
behavior assertions, and inspect template/snapshot changes rather than accepting
updated snapshots solely to make tests pass.

## Prepare a release

Once the behavior is ready, ask the assistant to prepare the local release:

```text
Prepare my-greeting for a registry release. Use an unused semantic version,
update its README, and create only this plugin's immutable archive and descriptor
with bun run build --publish --plugins=my-greeting. Run bun run check and
bun run site. Summarize the changes, capability requirements, validation results
and in-game checks still needed. Preserve every existing version artifact.
```

The selected publish build writes local files. Marketplace publication happens
when the registry PR is merged to `main`; it does not happen when the AI finishes
editing. Follow [Publishing](https://github.com/MRegterschot/tmcontrolpanel-plugins/wiki/Publishing)
to review and submit the source, tests and new version artifacts. Existing installs
remain pinned until an admin updates them.
