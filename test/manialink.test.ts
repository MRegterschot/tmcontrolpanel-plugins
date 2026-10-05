import { describe, expect, it } from "vitest";
import { readdirSync, existsSync } from "node:fs";
import { resolve, join } from "node:path";
import { TemplateRenderer } from "../.controlpanel/apps/gbx-service/src/core/manialink/template-renderer";
import { loadTemplateSources } from "../.controlpanel/apps/gbx-service/src/infra/templates";

const sources = loadTemplateSources(
  resolve(".controlpanel/apps/gbx-service/templates"),
);
for (const slug of readdirSync("plugins")) {
  const dir = join("plugins", slug, "templates");
  if (existsSync(dir)) Object.assign(sources, loadTemplateSources(dir));
}
const renderer = new TemplateRenderer(sources);
describe("TemplateRenderer", () => {
  it.each(renderer.names())("renders %s", (name) => {
    expect(
      renderer.render(name, {
        id: "test-id",
        position: { x: 1, y: 2 },
        size: { x: 50, y: 40 },
        title: "Title",
        hideWhileDriving: true,
        data: {
          actions: [{ name: "a", icon: "x", action: "act", type: "image" }],
          positionsAvailable: [1, 2],
          currentAction: { action: "pick", nickName: "Nick" },
        },
      }),
    ).toMatchSnapshot();
  });
});
