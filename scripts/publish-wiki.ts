import { copyFileSync, mkdtempSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const remote = "git@github.com:MRegterschot/tmcontrolpanel-plugins.wiki.git";
const pages = resolve("wiki");
const probe = spawnSync("git", ["ls-remote", remote], { encoding: "utf8" });
if (probe.status !== 0) {
  console.error(
    "GitHub's wiki repository is not available. Check your GitHub access.",
  );
  console.error("If this is a new wiki, create its first page at:");
  console.error(
    "https://github.com/MRegterschot/tmcontrolpanel-plugins/wiki/_new",
  );
  console.error(
    "Then rerun bun run wiki:publish. Prepared pages remain in wiki/.",
  );
  process.exit(1);
}

const work = mkdtempSync(join(tmpdir(), "tmcp-wiki-"));
function git(args: string[]) {
  const result = spawnSync("git", args, { cwd: work, encoding: "utf8" });
  if (result.status !== 0)
    throw new Error(result.stderr || `git ${args[0]} failed`);
  return result.stdout;
}
try {
  git(["clone", remote, "."]);
  for (const page of readdirSync(pages)) {
    if (page.endsWith(".md")) copyFileSync(join(pages, page), join(work, page));
  }
  git([
    "add",
    "--",
    ...readdirSync(pages).filter((page) => page.endsWith(".md")),
  ]);
  if (!git(["diff", "--cached", "--name-only"]).trim()) {
    console.log("The published wiki already matches wiki/.");
  } else {
    git([
      "commit",
      "-m",
      "Document plugin creation, development and publishing",
    ]);
    git(["push", "origin", "HEAD"]);
    console.log(
      "Published https://github.com/MRegterschot/tmcontrolpanel-plugins/wiki",
    );
  }
} finally {
  rmSync(work, { recursive: true, force: true });
}
