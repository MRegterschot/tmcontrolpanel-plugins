import { createHash } from "node:crypto";
import { unzipSync } from "fflate";

// Archive metadata varies between packing environments. Published bytes must
// still match their pinned checksum; source verification compares every file.
export function matchesPublishedSource(
  published: Uint8Array,
  rebuilt: Uint8Array,
  expectedSha256: string,
): boolean {
  const checksum = createHash("sha256").update(published).digest("hex");
  if (checksum !== expectedSha256)
    throw new Error("Published archive does not match its pinned checksum");
  const original = unzipSync(published);
  const current = unzipSync(rebuilt);
  const names = Object.keys(original);
  return (
    names.length === Object.keys(current).length &&
    names.every(
      (name) =>
        current[name] !== undefined &&
        Buffer.from(original[name]).equals(Buffer.from(current[name])),
    )
  );
}
