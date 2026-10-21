// @vitest-environment node
import { describe, expect, it } from "vitest";
import { firstNames, nonHumanClients, surnames } from "@/game/briefs/v1/names";
import { dataV1 } from "@/game/data/v1";
import { briefFor } from "./brief";
import { cardFor, initialsOf } from "./card";
import { placedDirections, type Challenge } from "./challenge";
import { clientFromSeed } from "./client";
import { generate } from "./generate";
import { shortLine } from "./short-line";

const challengeFor = (
  seed: string,
  difficulty: "easy" | "medium" | "hard" | "chaos" = "medium",
  burlap = false,
) =>
  generate({
    seed,
    difficulty,
    modifiers: burlap ? ["burlap"] : [],
    dataVersion: 1,
  });

describe("initialsOf", () => {
  it.each([
    ["Marguerite Holloway", "MH"],
    ["Lady Pearl Whiskers", "PW"],
    ["Gladys the Gargoyle", "GG"],
    ["Madame Pomme", "P"],
    ["Miss Pudding", "P"],
    ["Grandmother Moon-Mutterings", "M"],
    ["Old Nan Mossback", "NM"],
    ["Captain Olive Bramblecoat", "OB"],
  ])("%s gives %s", (name, initials) => {
    expect(initialsOf(name)).toBe(initials);
  });

  it("gives one or two letters for every name in the content lists", () => {
    const names = [
      ...nonHumanClients.map(({ name }) => name),
      ...firstNames.flatMap((first) => surnames.map((last) => `${first} ${last}`)),
    ];
    for (const name of names) {
      expect(initialsOf(name), name).toMatch(/^\p{Lu}{1,2}$/u);
    }
  });
});

describe("cardFor", () => {
  it("lists the placed directions in order with their real slots", () => {
    const challenge = challengeFor("k7m2qx9a", "hard");
    const card = cardFor(challenge);
    expect(card.rows.map((row) => row.direction)).toEqual(placedDirections(challenge));
    expect(card.rows.map((row) => row.shortLine)).toEqual(
      placedDirections(challenge).map(shortLine),
    );
    for (const row of card.rows) expect(challenge.directions[row.slot]).toBe(row.direction);
  });

  it("skips empty slots and keeps the other slots true", () => {
    const challenge = challengeFor("k7m2qx9a", "medium");
    const gapped: Challenge = {
      ...challenge,
      directions: challenge.directions.map((direction, i) => (i === 0 ? null : direction)),
    };
    const card = cardFor(gapped);
    expect(card.rows.map((row) => row.slot)).toEqual(
      challenge.directions.map((_, i) => i).filter((i) => i !== 0),
    );
  });

  it("pins Burlap only first as a modifier with no client line", () => {
    const [first, ...rest] = cardFor(challengeFor("k7m2qx9a", "easy", true)).rows;
    expect(first.direction.type).toBe("burlapOnly");
    expect(first.isModifier).toBe(true);
    expect(first.clientLine).toBeUndefined();
    for (const row of rest) {
      expect(row.isModifier).toBe(false);
      expect(row.clientLine).toBeTruthy();
    }
  });

  it("describes the client", () => {
    const card = cardFor(challengeFor("k7m2qx9a"));
    const client = clientFromSeed("k7m2qx9a");
    expect(card.client.name).toBe(client.name);
    expect(card.client.human).toBe(client.human);
    expect(card.client.initials).toBe(initialsOf(client.name));
  });

  it("labels the occasion with the phrase the brief used, without a leading article", () => {
    const phrases = dataV1.themes.flatMap((theme) => theme.occasions);
    for (let i = 0; i < 200; i++) {
      const challenge = challengeFor(`seed${i}abc`.slice(0, 8).padEnd(8, "k"));
      const card = cardFor(challenge);
      const phrase = phrases.find((occasion) => card.brief.includes(occasion));
      expect(phrase, card.brief).toBeDefined();
      expect(card.occasion).toBe(phrase!.replace(/^(a|an|the) /i, ""));
      expect(card.brief).toBe(briefFor(challenge, clientFromSeed(challenge.seed)));
    }
  });
});
