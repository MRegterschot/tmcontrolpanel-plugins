# Getting started

You need Git, Bun, and a panel checkout containing SDK 2. A running game server and
panel are needed for in-game testing, but not for the build and sandbox tests.
There is no separate SDK service, and the SDK is not currently published on npm.

## Prepare a registry checkout

```bash
git clone https://github.com/MRegterschot/tmcontrolpanel-plugins.git
cd tmcontrolpanel-plugins
git clone --branch refactor/monorepo-gbx-service https://github.com/MRegterschot/gocontrolpanel.git .controlpanel
cd .controlpanel
bun install --frozen-lockfile
DB=mysql bun run generate
cd ..
bun run setup
bun run check
```

`generate` creates Prisma types used by the test harness; it does not migrate or
reset a database. `setup` links the registry's `node_modules` to the SDK checkout.
If you already have a panel checkout, you can link it as `.controlpanel` instead
of cloning it. Both `.controlpanel` and `node_modules` are ignored local setup files;
do not force-add them to Git.

## Check that your tools work

```bash
bun .controlpanel/packages/plugin-sdk/src/cli/main.ts validate plugins/hello/versions/hello-1.1.0.zip
bun run test -- test/hello-plugin.test.ts
```

`bun run check` checks TypeScript, runs sandbox tests, compares source with the
published archives, and validates every registry version. A new source version
must be packaged before the source/archive comparison can pass.

## Run the registry locally

```bash
bun run dev
```

This generates `_site` and serves it at `http://127.0.0.1:4180/index.json`.
Set this in the panel's root `.env` and restart the panel and GBX service:

```dotenv
MARKETPLACE_INDEX_URL=http://127.0.0.1:4180/index.json
```

In separate terminals, from the panel checkout:

```bash
bun run dev
```

```bash
bun run dev:gbx
```

The loopback registry address works when all three processes run on the same
machine. For containers, use an address reachable from the containers.
After adding a version, rerun `bun run site`; the local server serves the new files.
Existing installs stay pinned until you select **Update** in the panel.
