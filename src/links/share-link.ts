import type { Challenge, Modifier } from "@/domain/challenge";
import type { Difficulty } from "@/domain/difficulty";
import { generate } from "@/domain/generate";
import { rebuild } from "@/domain/reroll";
import { isValidSeed } from "@/domain/seed";
import { dataVersions } from "@/game/data";

export type ShareLinkProblem =
  | "missingVersion"
  | "unknownVersion"
  | "repeatedParameter"
  | "badSeed"
  | "unknownDifficulty"
  | "unknownModifier"
  | "repeatedModifier"
  | "badRerolls"
  | "chaosRerolled";

export type ShareLinkResult =
  { ok: true; challenge: Challenge } | { ok: false; problem: ShareLinkProblem };

const PARAMETERS = ["v", "s", "d", "m", "r"];
const DIFFICULTIES: readonly string[] = ["easy", "medium", "hard", "chaos"];
const MODIFIERS: readonly string[] = ["burlap"];
const WHOLE_NUMBER = /^(0|[1-9]\d*)$/;

export function shareLinkFor(challenge: Challenge): string {
  const parts = [`v=${challenge.dataVersion}`, `s=${challenge.seed}`, `d=${challenge.difficulty}`];
  if (challenge.modifiers.length > 0) parts.push(`m=${challenge.modifiers.join(".")}`);
  if (challenge.history.length > 0) parts.push(`r=${challenge.history.join(".")}`);
  return `/c?${parts.join("&")}`;
}

const fail = (problem: ShareLinkProblem): ShareLinkResult => ({ ok: false, problem });

export function readShareLink(search: string | URLSearchParams): ShareLinkResult {
  const params = typeof search === "string" ? new URLSearchParams(search) : search;
  if (PARAMETERS.some((key) => params.getAll(key).length > 1)) return fail("repeatedParameter");

  const version = params.get("v");
  if (version === null) return fail("missingVersion");
  if (!WHOLE_NUMBER.test(version) || !dataVersions[Number(version)]) {
    return fail("unknownVersion");
  }

  const seed = params.get("s");
  if (seed === null || !isValidSeed(seed)) return fail("badSeed");

  const difficulty = params.get("d");
  if (difficulty === null || !DIFFICULTIES.includes(difficulty)) {
    return fail("unknownDifficulty");
  }

  const modifierText = params.get("m");
  const modifiers = modifierText === null ? [] : modifierText.split(".");
  if (!modifiers.every((item) => MODIFIERS.includes(item))) return fail("unknownModifier");
  if (new Set(modifiers).size !== modifiers.length) return fail("repeatedModifier");

  const historyText = params.get("r");
  const history = historyText === null ? [] : historyText.split(".");
  if (!history.every((item) => WHOLE_NUMBER.test(item))) return fail("badRerolls");
  const slots = history.map(Number);
  if (difficulty === "chaos" && slots.length > 0) return fail("chaosRerolled");

  const input = {
    seed,
    difficulty: difficulty as Difficulty,
    modifiers: modifiers as Modifier[],
    dataVersion: Number(version),
  };
  const start = generate(input);
  const allInRange = slots.every(
    (slot) => slot < start.plan.length && start.directions[slot]?.type !== "burlapOnly",
  );
  if (!allInRange) return fail("badRerolls");

  try {
    return { ok: true, challenge: rebuild({ ...input, history: slots }) };
  } catch {
    return fail("badRerolls");
  }
}
