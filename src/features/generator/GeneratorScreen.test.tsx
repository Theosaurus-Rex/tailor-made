import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { clientFromSeed } from "@/domain/client";
import { latestData } from "@/game/data";
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
});
