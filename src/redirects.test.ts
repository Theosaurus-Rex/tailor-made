import { describe, expect, it } from "vitest";
import redirects from "../public/_redirects?raw";

describe("netlify redirects", () => {
  it("sends every path to the app", () => {
    const rules = redirects.split("\n").map((line) => line.trim().split(/\s+/));
    expect(rules).toContainEqual(["/*", "/index.html", "200"]);
  });
});
