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
// Fresh per render: handlebars-layouts keeps its block state on the context object
const context = () => ({
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
});
describe("TemplateRenderer", () => {
  it.each(renderer.names())("renders %s", (name) => {
    expect(renderer.render(name, context())).toMatchSnapshot();
  });

  // Every default theme color, white and black must come from the theme, so another theme replaces all of them
  const themed = new TemplateRenderer(sources, {
    quad: { foreground: "A01", background: "A02", foregroundMuted: "A03", backgroundMuted: "A04" },
    label: { foreground: "B01", background: "B02", foregroundMuted: "B03", backgroundMuted: "B04" },
  });
  it.each(themed.names())("uses the theme colors in %s", (name) => {
    const xml = themed.render(name, context());
    expect(xml).not.toMatch(
      /color[12]?="(DDD|222|CCC|333|fff|000)[0-9a-f]?"|ToRgb\("(DDD|222|CCC|333|fff|000)"\)/i,
    );
    expect(xml).not.toMatch(/color[12]?=""|ToRgb\(""\)/);
    // Quads take the quad palette, labels and entries the label palette
    expect(xml).not.toMatch(/<quad\b[^>]*="B0\d|<(label|entry)\b[^>]*="A0\d/);
    expect(xml).not.toMatch(/CMlQuad\)\.\w+ = CL::Hex3ToRgb\("B0|CMlLabel\)\.\w+ = CL::Hex3ToRgb\("A0/);
  });
});
