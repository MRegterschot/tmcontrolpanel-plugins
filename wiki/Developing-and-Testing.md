# Developing and testing

## The edit/build/install loop

1. Edit the plugin's source, templates or manifest.
2. Run `bun run typecheck` and the relevant tests.
3. Raise `tmcp-plugin.json`'s version when changing an already uploaded/published package.
4. Build with `bun .controlpanel/packages/plugin-sdk/src/cli/main.ts pack plugins/<slug>`.
5. Upload the zip on the panel's Plugins page and install/update it on your test server.
6. Exercise its commands, events, buttons and configuration changes in game.

Saved plugin settings and enabled state are retained when updating a version.
A version can request additional capabilities; review those permissions before accepting.
Check GBX service logs for plugin load errors, timeouts and denied host calls.

Private uploads cannot use the reserved first-party slugs. To test a first-party
change, publish a new **local** registry archive, rebuild the local site and use
**Update** from the server's Plugins page. Merging a PR is not needed for local testing.
Do not reuse a version with different bytes: stored versions are pinned by checksum.

## Sandbox tests

Tests run the packaged plugin in the same sandbox as the service, with fake GBX,
clock, database and external services. No live server is required.

```ts
import { expect, it } from "vitest";
import { createHarness, firstPartyPackage, player } from "./fakes/harness";

it("responds to the greeting command", async () => {
  const h = await createHarness({
    players: [player("p1")],
    packages: [{
      bytes: await firstPartyPackage("my-greeting"),
      config: { message: "Hello" },
    }],
  });
  await h.chat("p1", "/my-greeting");
  expect(h.session.callsTo("ChatSendServerMessageToLogin").at(-1)?.params)
    .toEqual(["Hello", "p1"]);
});
```

Put the test in `test/my-greeting.test.ts`. Despite the helper's historical name,
`firstPartyPackage` can pack any source plugin under `plugins/`.
Use `h.click(login, "slug:action")` for manialink buttons, `h.callback` for GBX
callbacks, `h.script` for script events, and `h.clock.advance(ms)` for timers.
Read `test/hello-plugin.test.ts` for command, action, storage and connection examples.

```bash
bun run test -- test/hello-plugin.test.ts
bun run typecheck
bun run test
```

Tests should cover observable behavior, permission boundaries, config updates and
cleanup when relevant. A passing test is not a substitute for checking the final
layout and gameplay behavior on a dedicated server.

## Verify a release

Once the manifest has a new version:

```bash
bun run build --publish --plugins=my-greeting
bun run check
bun run site
```

The selected publish build writes `versions/<version>.json` and its zip without
replacing old versions. The normal build checks the current source checksum against
that archive. Keep generated `dist/`, `_site/`, `.controlpanel` and `node_modules`
out of commits; include the immutable `versions/` artifacts in the release PR.
