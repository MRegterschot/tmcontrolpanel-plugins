export {
  createHarness,
  player,
  type HarnessOptions,
} from "../../.controlpanel/apps/gbx-service/test/fakes/harness";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { packPlugin } from "@tmcontrolpanel/plugin-sdk/cli";

const plugins = fileURLToPath(new URL("../../plugins", import.meta.url));
const packages = new Map<string, Promise<Uint8Array>>();
export function firstPartyPackage(slug: string): Promise<Uint8Array> {
  let bytes = packages.get(slug);
  if (!bytes) {
    const outDir = mkdtempSync(join(tmpdir(), `tmcp-${slug}-`));
    bytes = packPlugin(join(plugins, slug), { outDir })
      .then((result) => result.bytes)
      .finally(() => rmSync(outDir, { recursive: true, force: true }));
    packages.set(slug, bytes);
  }
  return bytes;
}
