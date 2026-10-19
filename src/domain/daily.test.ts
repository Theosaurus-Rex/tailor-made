import { describe, expect, it } from "vitest";

import { LATEST_DATA_VERSION } from "@/game/data";
import { dataV1 } from "@/game/data/v1";
import { dailyChallenge, dailyDifficulty, weekdayOf, type Weekday } from "./daily";
import { generate } from "./generate";

const WEEK: Weekday[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const pad = (n: number, width: number) => String(n).padStart(width, "0");

function nextDay(date: string): string {
  const [year, month, day] = date.split("-").map(Number);
  const leap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  const length = month === 2 ? (leap ? 29 : 28) : [4, 6, 9, 11].includes(month) ? 30 : 31;
  if (day < length) return `${pad(year, 4)}-${pad(month, 2)}-${pad(day + 1, 2)}`;
  if (month < 12) return `${pad(year, 4)}-${pad(month + 1, 2)}-01`;
  return `${pad(year + 1, 4)}-01-01`;
}

const week = [
  ["2026-10-12", "monday", "easy"],
  ["2026-10-13", "tuesday", "medium"],
  ["2026-10-14", "wednesday", "medium"],
  ["2026-10-15", "thursday", "hard"],
  ["2026-10-16", "friday", "hard"],
  ["2026-10-17", "saturday", "hard"],
  ["2026-10-18", "sunday", "chaos"],
] as const;

describe("weekdayOf", () => {
  it.each(week)("%s is a %s", (date, weekday) => {
    expect(weekdayOf(date)).toBe(weekday);
  });

  it("cycles through the week in order for 1,000 days", () => {
    let date = "2026-10-12";
    for (let i = 0; i < 1000; i++) {
      expect(weekdayOf(date), date).toBe(WEEK[i % 7]);
      date = nextDay(date);
    }
  });

  it("gets leap days and year ends right", () => {
    expect(weekdayOf("2028-02-29")).toBe("tuesday");
    expect(weekdayOf("2028-03-01")).toBe("wednesday");
    expect(weekdayOf("2026-12-31")).toBe("thursday");
    expect(weekdayOf("2027-01-01")).toBe("friday");
    expect(weekdayOf("2000-02-29")).toBe("tuesday");
    expect(weekdayOf("1900-03-01")).toBe("thursday");
  });

  it.each(["2026-02-29", "2026-13-01", "2026-00-10", "2026-10-32", "26-10-16", "k7m2qx9a", ""])(
    "throws for %j",
    (date) => {
      expect(() => weekdayOf(date)).toThrow(RangeError);
    },
  );
});

describe("dailyDifficulty", () => {
  it.each(week)("%s (%s) is %s", (date, _weekday, difficulty) => {
    expect(dailyDifficulty(date)).toBe(difficulty);
  });

  it("follows the weekday table in the game data", () => {
    const data = {
      ...dataV1,
      dailyDifficulties: { ...dataV1.dailyDifficulties, thursday: "easy" as const },
    };
    expect(dailyDifficulty("2026-10-15", data)).toBe("easy");
    expect(dailyDifficulty("2026-10-15")).toBe("hard");
  });
});

describe("dailyChallenge", () => {
  it("uses the date as the seed, no modifiers and the latest data version", () => {
    const challenge = dailyChallenge("2026-10-16");
    expect(challenge.seed).toBe("2026-10-16");
    expect(challenge.modifiers).toEqual([]);
    expect(challenge.dataVersion).toBe(LATEST_DATA_VERSION);
    expect(challenge.difficulty).toBe("hard");
  });

  it("matches generate with the same inputs", () => {
    for (const [date, , difficulty] of week) {
      expect(dailyChallenge(date)).toEqual(
        generate({ seed: date, difficulty, modifiers: [], dataVersion: LATEST_DATA_VERSION }),
      );
    }
  });

  it("is the same every time for one date", () => {
    expect(dailyChallenge("2026-10-19")).toEqual(dailyChallenge("2026-10-19"));
  });

  it("throws for an invalid date", () => {
    expect(() => dailyChallenge("2026-02-30")).toThrow(RangeError);
  });
});
