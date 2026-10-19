import { LATEST_DATA_VERSION, dataVersions, latestData } from "@/game/data";
import type { Weekday } from "@/game/data/difficulty-shapes";
import type { GameData } from "@/game/data/v1";
import type { Challenge } from "./challenge";
import type { Difficulty } from "./difficulty";
import { generate } from "./generate";
import { parseDailySeed } from "./seed";

export type { Weekday };

const MONTH_OFFSETS = [0, 3, 2, 5, 0, 3, 5, 1, 4, 6, 2, 4];
const SUNDAY_FIRST: Weekday[] = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

export function weekdayOf(date: string): Weekday {
  const parsed = parseDailySeed(date);
  if (!parsed) throw new RangeError(`${date} is not a date like 2026-10-16`);
  // Sakamoto's method for the day of the week.
  const year = parsed.month < 3 ? parsed.year - 1 : parsed.year;
  const leapDays = Math.floor(year / 4) - Math.floor(year / 100) + Math.floor(year / 400);
  return SUNDAY_FIRST[(year + leapDays + MONTH_OFFSETS[parsed.month - 1] + parsed.day) % 7];
}

export function dailyDifficulty(date: string, data: GameData = latestData): Difficulty {
  return data.dailyDifficulties[weekdayOf(date)];
}

export function dailyChallenge(date: string, dataVersion = LATEST_DATA_VERSION): Challenge {
  const data = dataVersions[dataVersion];
  if (!data) throw new RangeError(`unknown data version ${dataVersion}`);
  return generate(
    { seed: date, difficulty: dailyDifficulty(date, data), modifiers: [], dataVersion },
    data,
  );
}
