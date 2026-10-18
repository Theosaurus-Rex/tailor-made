import { describe, expect, it } from "vitest";
import { firstNames, nonHumanClients, surnames } from "@/game/briefs/v1/names";
import { personalities } from "@/game/briefs/v1/personalities";
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
    expect(clientFromSeed("abc23456")).toEqual({
      name: "Noor Ibarra",
      human: true,
      personality: "grand",
    });
    expect(clientFromSeed("2026-10-16")).toEqual({
      name: "Cecily Oakhurst",
      human: true,
      personality: "grand",
    });
    expect(clientFromSeed("k7m2qx9a")).toEqual({
      name: "Freya Lindqvist",
      human: true,
      personality: "brisk",
    });
    expect(clientFromSeed("w9x8y7v6")).toEqual({
      name: "Winnie Hollowmere",
      human: false,
      kind: "friendly ghost",
      personality: "grand",
    });
    expect(clientFromSeed("hello")).toEqual({
      name: "Gwendolyn Nakamura",
      human: true,
      personality: "anxious",
    });
    expect(clientFromSeed("zzzzzzzz")).toEqual({
      name: "Philippa Tremaine",
      human: true,
      personality: "deadpan",
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

  it("shares personalities out evenly", () => {
    const total = 6_000;
    const counts = new Map<string, number>();
    for (let i = 0; i < total; i++) {
      const { personality } = clientFromSeed(deriveSeed("share", i));
      counts.set(personality, (counts.get(personality) ?? 0) + 1);
    }
    for (const personality of personalities) {
      const share = (counts.get(personality) ?? 0) / total;
      expect(Math.abs(share - 1 / personalities.length)).toBeLessThan(0.03);
    }
  });
});
