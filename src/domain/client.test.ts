import { describe, expect, it } from "vitest";
import { firstNames, nonHumanClients, surnames } from "@/game/briefs/v1/names";
import { clientFromSeed } from "./client";
import { deriveSeed } from "./random";

describe("clientFromSeed", () => {
  it("gives the same client for the same seed", () => {
    expect(clientFromSeed("abc23456")).toEqual(clientFromSeed("abc23456"));
  });

  it("gives different clients across different seeds", () => {
    const names = new Set(
      Array.from({ length: 50 }, (_, i) => clientFromSeed(deriveSeed("sample", i)).name),
    );
    expect(names.size).toBeGreaterThan(40);
  });

  it("pins the client for fixed seeds", () => {
    expect(clientFromSeed("abc23456")).toEqual({ name: "Orla Ibarra", human: true });
    expect(clientFromSeed("2026-10-16")).toEqual({ name: "Cecil Oakhurst", human: true });
    expect(clientFromSeed("k7m2qx9a")).toEqual({ name: "Ffion Lindqvist", human: true });
    expect(clientFromSeed("w9x8y7v6")).toEqual({
      name: "Wilbur Hollowmere",
      human: false,
      kind: "friendly ghost",
    });
  });

  it("makes non-human clients at about the chosen share, with names from the lists", () => {
    const total = 10_000;
    let nonHuman = 0;
    for (let i = 0; i < total; i++) {
      const client = clientFromSeed(deriveSeed("sample", i));
      if (client.human) {
        const [first, ...rest] = client.name.split(" ");
        expect(firstNames).toContain(first);
        expect(surnames).toContain(rest.join(" "));
        expect(client.kind).toBeUndefined();
      } else {
        nonHuman++;
        expect(nonHumanClients).toContainEqual({ name: client.name, kind: client.kind });
      }
    }
    expect(nonHuman / total).toBeGreaterThan(0.08);
    expect(nonHuman / total).toBeLessThan(0.12);
  });
});
