import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  parseManifest,
  validatePluginConfig,
  coercePluginConfig,
  maskSecrets,
} from "@gcp/shared";

function schema(slug: string) {
  const manifest = parseManifest(
    JSON.parse(readFileSync(`plugins/${slug}/tmcp-plugin.json`, "utf8")),
  );
  if (!manifest.success) throw new Error(manifest.issues.join("; "));
  return manifest.manifest.configSchema!;
}

describe("registry-owned config forms", () => {
  it("groups match settings into General, Pick and Ban, and Lobby tabs", () => {
    expect(schema("match").tabs).toEqual([
      {
        id: "general",
        title: "General",
        properties: ["script", "maps", "admins"],
      },
      { id: "pick-and-ban", title: "Pick and Ban", properties: ["pickAndBan"] },
      { id: "lobby", title: "Lobby", properties: ["lobby"] },
    ]);
  });
  it.each(["ecm", "live-round", "records-info", "player-info", "match"])(
    "ships a valid form for %s",
    (slug) => {
      expect(schema(slug)).toBeDefined();
    },
  );
  it.each([
    { slug: "ecm", config: { editors: [""] } },
    { slug: "player-info", config: { playerInfos: [{ login: "" }] } },
    { slug: "match", config: { admins: [""] } },
    {
      slug: "match",
      config: { pickAndBan: { players: [{ login: "", seed: 1 }] } },
    },
    {
      slug: "match",
      config: { pickAndBan: { teams: [{ seed: 1, players: [""] }] } },
    },
  ])("requires selected users in $slug", ({ slug, config }) => {
    const result = validatePluginConfig(schema(slug), config);
    expect(result.success).toBe(false);
    if (!result.success)
      expect(
        result.issues.some(
          (issue) => issue.message === "Search for a user and select a result",
        ),
      ).toBe(true);
  });
  it("round trips stored match config without changing its wire format", () => {
    const config = {
      script: "Match.Script.txt",
      maps: ["Maps/one.Map.Gbx", "Maps/two.Map.Gbx"],
      admins: ["admin-login"],
      pickAndBan: {
        type: "team",
        order: "b:1,p:2",
        choosePosition: false,
        timeout: 20,
        players: [],
        teams: [{ seed: 1, name: "Team", players: ["player-login"] }],
      },
      lobby: { script: "Lobby.Script.txt", map: "Maps/lobby.Map.Gbx" },
    };
    expect(validatePluginConfig(schema("match"), config)).toEqual({
      success: true,
      data: config,
    });
    expect(coercePluginConfig(schema("match"), config)).toEqual({
      data: config,
      issues: [],
    });
    expect(
      validatePluginConfig(schema("match"), { ...config, maps: [] }).success,
    ).toBe(false);
  });
  it("keeps API keys out of displayed and exported config", () => {
    expect(
      maskSecrets(schema("ecm"), {
        apiKey: "match_secret",
        editors: ["login"],
      }),
    ).toEqual({ config: { editors: ["login"] }, setSecrets: ["apiKey"] });
    expect(validatePluginConfig(schema("ecm"), { apiKey: "bad" }).success).toBe(
      false,
    );
  });
});
