import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { cardFor } from "@/domain/card";
import { clientFromSeed } from "@/domain/client";
import { generate } from "@/domain/generate";
import { reroll } from "@/domain/reroll";
import { latestData } from "@/game/data";
import { shareLinkFor, readShareLink } from "@/links/share-link";
import { newSeed } from "@/lib/new-seed";

import { GeneratorScreen } from "./GeneratorScreen";

vi.mock("@/lib/new-seed", () => ({ newSeed: vi.fn() }));

const SEEDS = ["k7m2qx9a", "p3n8vd4w", "h5t2cz6r", "w9b4jy7e", "m2q6xk8s", "d8f3ra5n"];

const DIFFICULTIES = [
  ["Easy", "easy"],
  ["Medium", "medium"],
  ["Hard", "hard"],
  ["Chaos", "chaos"],
] as const;

const generateButton = () => screen.getByRole("button", { name: /^generate/i });
const directionRows = () => within(screen.getByRole("list")).getAllByRole("listitem");

beforeEach(() => {
  let call = 0;
  vi.mocked(newSeed).mockImplementation(() => SEEDS[call++ % SEEDS.length]);
});

describe("GeneratorScreen", () => {
  it("shows the empty state before the first generate", () => {
    render(<GeneratorScreen />);
    expect(screen.getByRole("heading", { name: "No client yet" })).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Medium" })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "Burlap only" })).not.toBeChecked();
  });

  for (const [label, key] of DIFFICULTIES) {
    it(`gives a ${label} card within that difficulty's direction range`, () => {
      render(<GeneratorScreen />);
      fireEvent.click(screen.getByRole("radio", { name: label }));
      SEEDS.forEach(() => {
        fireEvent.click(generateButton());
        const { min, max } = latestData.difficulties[key].directionCount;
        expect(directionRows().length).toBeGreaterThanOrEqual(min);
        expect(directionRows().length).toBeLessThanOrEqual(max);
      });
    });
  }

  it("makes a Burlap only first row when Burlap only is ticked", () => {
    render(<GeneratorScreen />);
    fireEvent.click(screen.getByRole("checkbox", { name: "Burlap only" }));
    fireEvent.click(generateButton());
    expect(within(directionRows()[0]).getByText("Modifier")).toBeInTheDocument();
    expect(screen.getByText(/· Burlap on$/)).toBeInTheDocument();
  });

  it("gives a different client each time it generates", () => {
    render(<GeneratorScreen />);
    fireEvent.click(generateButton());
    const first = screen.getByRole("heading", { level: 2 }).textContent;
    expect(first).toBe(clientFromSeed(SEEDS[0]).name);
    fireEvent.click(generateButton());
    const second = screen.getByRole("heading", { level: 2 }).textContent;
    expect(second).toBe(clientFromSeed(SEEDS[1]).name);
    expect(second).not.toBe(first);
  });

  it("moves focus to the client name after generating", () => {
    render(<GeneratorScreen />);
    fireEvent.click(generateButton());
    expect(screen.getByRole("heading", { level: 2 })).toHaveFocus();
  });

  it("updates the line under the dial with the selected difficulty", () => {
    render(<GeneratorScreen />);
    for (const [label, key] of DIFFICULTIES) {
      fireEvent.click(screen.getByRole("radio", { name: label }));
      const { min, max } = latestData.difficulties[key].directionCount;
      expect(screen.getByRole("radio", { name: label })).toBeChecked();
      expect(screen.getByText(`${min}–${max} directions`)).toBeInTheDocument();
    }
  });

  describe("rerolling a direction", () => {
    const rowTexts = () => directionRows().map((row) => row.textContent);
    const rerollButtons = () => screen.queryAllByRole("button", { name: /^reroll/i });
    const ticks = () => within(screen.getByRole("list")).getAllByRole("checkbox");

    it("changes only that row and clears only its tick", () => {
      render(<GeneratorScreen />);
      fireEvent.click(generateButton());
      ticks().forEach((box) => fireEvent.click(box));
      const before = rowTexts();
      fireEvent.click(rerollButtons()[1]);
      const after = rowTexts();
      expect(after).toHaveLength(before.length);
      expect(after[1]).not.toBe(before[1]);
      after.forEach((text, i) => {
        if (i !== 1) expect(text).toBe(before[i]);
      });
      const boxes = ticks();
      expect(boxes[1]).not.toBeChecked();
      boxes.forEach((box, i) => {
        if (i !== 1) expect(box).toBeChecked();
      });
      expect(screen.getByText(/Direction 2 swapped for a new one/)).toBeInTheDocument();
      expect(within(directionRows()[1]).getByText("New direction")).toBeInTheDocument();
    });

    it("clears the swapped note when a new client is generated", () => {
      render(<GeneratorScreen />);
      fireEvent.click(generateButton());
      fireEvent.click(rerollButtons()[0]);
      fireEvent.click(generateButton());
      expect(screen.queryByText(/swapped for a new one/)).not.toBeInTheDocument();
      expect(screen.queryByText("New direction")).not.toBeInTheDocument();
    });

    it("gives Burlap only a Fixed label and no reroll button", () => {
      render(<GeneratorScreen />);
      fireEvent.click(screen.getByRole("checkbox", { name: "Burlap only" }));
      fireEvent.click(generateButton());
      const first = directionRows()[0];
      expect(within(first).getByText("Fixed")).toBeInTheDocument();
      expect(within(first).queryByRole("button")).not.toBeInTheDocument();
      expect(rerollButtons()).toHaveLength(directionRows().length - 1);
    });

    it("gives a Chaos card no reroll buttons and says why", () => {
      render(<GeneratorScreen />);
      fireEvent.click(screen.getByRole("radio", { name: "Chaos" }));
      fireEvent.click(generateButton());
      expect(rerollButtons()).toHaveLength(0);
      expect(screen.queryByText("Fixed")).not.toBeInTheDocument();
      expect(screen.getByText("Chaos cards can't be rerolled.")).toBeInTheDocument();
    });

    it("makes a share link that opens to the rerolled card", () => {
      render(<GeneratorScreen />);
      fireEvent.click(generateButton());
      fireEvent.click(rerollButtons()[2]);
      const start = generate({
        seed: SEEDS[0],
        difficulty: "medium",
        modifiers: [],
        dataVersion: 1,
      });
      const rerolled = reroll(start, 2);
      const link = readShareLink(shareLinkFor(rerolled).split("?")[1]);
      if (!link.ok) throw new Error(link.problem);
      expect(link.challenge).toEqual(rerolled);
      expect(cardFor(link.challenge).rows.map((row) => row.shortLine)).toEqual(
        directionRows().map((row) => row.querySelector("label")?.textContent),
      );
    });
  });
});
