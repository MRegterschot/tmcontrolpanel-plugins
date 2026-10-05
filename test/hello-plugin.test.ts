import { describe, expect, it } from "vitest";
import { createHarness, firstPartyPackage, player } from "./fakes/harness";

const page = "plg.hello.greeting";
async function setup(config = { greeting: "Welcome", showWidget: true }) {
  return createHarness({
    players: [player("p1")],
    packages: [{ bytes: await firstPartyPackage("hello"), config }],
  });
}

describe("hello example plugin", () => {
  it("greets from its command and widget button, keeping a per-player count", async () => {
    const h = await setup();
    await h.chat("p1", "/hello");
    await h.click("p1", "hello:wave");
    const messages = h.session
      .callsTo("ChatSendServerMessageToLogin")
      .map((call) => call.params);
    expect(messages).toContainEqual(["Welcome Nick p1! (greeting #1)", "p1"]);
    expect(messages).toContainEqual(["Welcome Nick p1! (greeting #2)", "p1"]);
    expect(h.session.lastManialink(page)).toContain("2 greetings so far");
    expect(h.session.lastManialink(page)).toContain('action="hello:wave"');
    expect(
      await h.pluginStorage.get("server-1", "plugin-hello", "greetings:p1"),
    ).toBe(2);
  });

  it("uses the configured greeting and can run without a widget", async () => {
    const h = await setup({ greeting: "Hi", showWidget: false });
    await h.chat("p1", "/hello");
    expect(
      h.session.callsTo("ChatSendServerMessageToLogin").at(-1)?.params,
    ).toEqual(["Hi Nick p1! (greeting #1)", "p1"]);
    expect(h.session.lastManialink(page)).toBeNull();
  });

  it("applies settings changes without replacing the package", async () => {
    const h = await setup({ greeting: "Hi", showWidget: false });
    await h.servers.updatePluginConfig("server-1", "plugin-hello", {
      greeting: "Hey",
      showWidget: true,
    });
    await h.runtime.refreshPlugins();
    expect(h.session.lastManialink(page)).toContain("Hey!");
    await h.chat("p1", "/hello");
    expect(
      h.session.callsTo("ChatSendServerMessageToLogin").at(-1)?.params,
    ).toEqual(["Hey Nick p1! (greeting #1)", "p1"]);
  });

  it("greets newly connected players", async () => {
    const h = await setup();
    h.world.players.push(player("p2"));
    await h.callback("ManiaPlanet.PlayerConnect", ["p2", false]);
    expect(
      h.session.callsTo("ChatSendServerMessageToLogin").at(-1)?.params,
    ).toEqual(["Welcome Nick p2! (greeting #1)", "p2"]);
  });
});
