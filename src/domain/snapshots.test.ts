// @vitest-environment node
import { describe, expect, it } from "vitest";
import { buildSnapshots, snapshotInputs } from "./fixtures/challenge-snapshots";
import fixture from "./fixtures/challenges-v1.json";

const WARNING =
  "Changing these breaks every share link made with data version 1. " +
  "If the change is deliberate, it needs a new data version, not a rewritten fixture.";

describe("challenges pinned for data version 1", () => {
  const rebuilt = buildSnapshots() as { input: unknown }[];

  it("covers every pinned input", () => {
    expect(fixture.map((entry) => entry.input)).toEqual(snapshotInputs);
  });

  it("still rebuilds every pinned challenge exactly", () => {
    const moved = fixture
      .filter((entry, i) => JSON.stringify(entry) !== JSON.stringify(rebuilt[i]))
      .map((entry) => JSON.stringify(entry.input));
    expect(moved, `${WARNING}\nChanged: ${moved.length} of ${fixture.length}`).toEqual([]);
  });
});
