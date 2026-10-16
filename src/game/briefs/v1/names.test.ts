import { describe, expect, it } from "vitest";
import { firstNames, nonHumanClients, surnames } from "./names";

const nonHumanNames = nonHumanClients.map((client) => client.name);
const kinds = nonHumanClients.map((client) => client.kind);

describe.each([
  ["first names", firstNames],
  ["surnames", surnames],
  ["non-human client names", nonHumanNames],
  ["non-human kinds", kinds],
] as [string, readonly string[]][])("%s", (_label, list) => {
  it("has no duplicates", () => {
    expect(new Set(list).size).toBe(list.length);
  });

  it("has no blank entries and no stray spaces", () => {
    for (const entry of list) {
      expect(entry.trim()).toBe(entry);
      expect(entry.length).toBeGreaterThan(0);
    }
  });
});
