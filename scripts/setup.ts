import { existsSync, symlinkSync } from "node:fs";
import { resolve } from "node:path";

// Share dependencies with the panel checkout that provides the SDK and sandbox harness.
const dependencies = resolve(".controlpanel/node_modules");
if (!existsSync(dependencies))
  throw new Error("Run bun install --frozen-lockfile in .controlpanel first");
if (!existsSync("node_modules"))
  symlinkSync(dependencies, "node_modules", "dir");
