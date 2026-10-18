import { describe, expect, it } from "vitest";

import { dailyChallenge } from "@/domain/daily";
import { nextUtcMidnight, utcDateOf } from "./utc-date";

describe("utcDateOf", () => {
  it("gives the same date and challenge for any moment on one UTC day", () => {
    const early = new Date("2026-10-16T00:30:00Z");
    const late = new Date("2026-10-16T23:30:00Z");
    expect(utcDateOf(early)).toBe("2026-10-16");
    expect(utcDateOf(late)).toBe("2026-10-16");
    expect(dailyChallenge(utcDateOf(early))).toEqual(dailyChallenge(utcDateOf(late)));
  });

  it("ignores the local date, whatever the offset", () => {
    const eastOfUtc = new Date("2026-10-16T00:30:00+13:00");
    const westOfUtc = new Date("2026-10-16T23:30:00-05:00");
    expect(utcDateOf(eastOfUtc)).toBe("2026-10-15");
    expect(utcDateOf(westOfUtc)).toBe("2026-10-17");
    expect(utcDateOf(westOfUtc)).toBe(utcDateOf(new Date("2026-10-17T04:30:00Z")));
    expect(dailyChallenge(utcDateOf(westOfUtc))).toEqual(
      dailyChallenge(utcDateOf(new Date("2026-10-17T20:00:00Z"))),
    );
  });

  it("rolls over exactly at UTC midnight", () => {
    expect(utcDateOf(new Date("2026-10-16T23:59:59.999Z"))).toBe("2026-10-16");
    expect(utcDateOf(new Date("2026-10-17T00:00:00.000Z"))).toBe("2026-10-17");
  });
});

describe("nextUtcMidnight", () => {
  it.each([
    ["2026-10-16T08:15:00Z", "2026-10-17T00:00:00.000Z"],
    ["2026-10-17T00:00:00Z", "2026-10-18T00:00:00.000Z"],
    ["2026-10-31T23:59:59Z", "2026-11-01T00:00:00.000Z"],
    ["2026-12-31T12:00:00Z", "2027-01-01T00:00:00.000Z"],
    ["2028-02-28T12:00:00Z", "2028-02-29T00:00:00.000Z"],
    ["2026-10-16T23:30:00-05:00", "2026-10-18T00:00:00.000Z"],
  ])("after %s comes %s", (moment, expected) => {
    expect(nextUtcMidnight(new Date(moment)).toISOString()).toBe(expected);
  });
});
