import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { briefFor } from "@/domain/brief";
import { clientFromSeed } from "@/domain/client";
import { generate } from "@/domain/generate";
import { shortLine } from "@/domain/short-line";

import { DebugScreen } from "./DebugScreen";

const SEED = "k7m2qx9a";

const shortLinesFor = (seed: string) =>
  generate({ seed, difficulty: "medium", modifiers: [], dataVersion: 1 })
    .directions.filter((direction) => direction !== null)
    .map((direction) => shortLine(direction));

describe("DebugScreen", () => {
  it("shows the client and every short line for the seed", () => {
    render(<DebugScreen />);
    const single = screen.getByRole("region", { name: /single seed/i });
    expect(within(single).getByText(new RegExp(clientFromSeed(SEED).name))).toBeInTheDocument();
    for (const line of shortLinesFor(SEED)) {
      expect(within(single).getAllByText(`Short line: ${line}`).length).toBeGreaterThan(0);
    }
  });

  it("shows the brief for the seed", () => {
    render(<DebugScreen />);
    const challenge = generate({ seed: SEED, difficulty: "medium", modifiers: [], dataVersion: 1 });
    const brief = briefFor(challenge, clientFromSeed(SEED));
    expect(screen.getByText(`Brief: ${brief}`)).toBeInTheDocument();
  });

  it("shows a message for an invalid seed", () => {
    render(<DebugScreen />);
    fireEvent.change(screen.getByLabelText("Seed"), { target: { value: "nope" } });
    expect(screen.getByRole("alert")).toHaveTextContent("not a valid seed");
  });

  it("loads a batch seed into the single view when its row is clicked", () => {
    render(<DebugScreen />);
    const [, firstRow] = screen.getAllByRole("row");
    const button = within(firstRow).getByRole("button");
    const seed = button.textContent;
    expect(seed).not.toBe(SEED);
    fireEvent.click(button);
    expect(screen.getByLabelText("Seed")).toHaveValue(seed);
  });
});
