import { fireEvent, render, screen, within } from "@testing-library/react";
import axe from "axe-core";
import { describe, expect, it, vi } from "vitest";

import { cardFor } from "@/domain/card";
import { generate } from "@/domain/generate";
import { reroll } from "@/domain/reroll";

import { ClientCard } from "./ClientCard";

const challenge = (difficulty: "easy" | "medium" | "hard" | "chaos", burlap = false) =>
  generate({
    seed: "k7m2qx9a",
    difficulty,
    modifiers: burlap ? ["burlap"] : [],
    dataVersion: 1,
  });

const cardOf = (difficulty: "easy" | "medium" | "hard" | "chaos" = "medium", burlap = false) =>
  cardFor(challenge(difficulty, burlap));

const noop = vi.fn();

const boxes = () => screen.getAllByRole("checkbox");

describe("ticking", () => {
  it("ticks a direction and clears it when ticked again", () => {
    render(<ClientCard card={cardOf()} />);
    const [first] = boxes();
    expect(first).not.toBeChecked();
    fireEvent.click(first);
    expect(first).toBeChecked();
    fireEvent.click(first);
    expect(first).not.toBeChecked();
  });

  it("ticks from the label text", () => {
    const card = cardOf();
    render(<ClientCard card={card} />);
    fireEvent.click(screen.getByText(card.rows[0].shortLine));
    expect(boxes()[0]).toBeChecked();
  });

  it("counts the ticks", () => {
    const card = cardOf();
    render(<ClientCard card={card} />);
    const total = card.rows.length;
    expect(screen.getByText(`0 of ${total} ticked`)).toBeInTheDocument();
    fireEvent.click(boxes()[0]);
    expect(screen.getByText(`1 of ${total} ticked`)).toBeInTheDocument();
  });

  it("shows the done line only when every direction is ticked", () => {
    render(<ClientCard card={cardOf()} />);
    const all = boxes();
    all.slice(0, -1).forEach((box) => fireEvent.click(box));
    expect(screen.queryByText("Ready to hand over.")).not.toBeInTheDocument();
    fireEvent.click(all.at(-1)!);
    expect(screen.getByText("Ready to hand over.")).toBeInTheDocument();
    expect(screen.getByText("All directions ticked")).toBeInTheDocument();
    fireEvent.click(all[0]);
    expect(screen.queryByText("Ready to hand over.")).not.toBeInTheDocument();
  });

  it("starts with nothing ticked on every render", () => {
    const card = cardOf();
    const { unmount } = render(<ClientCard card={card} />);
    fireEvent.click(boxes()[0]);
    unmount();
    render(<ClientCard card={card} />);
    boxes().forEach((box) => expect(box).not.toBeChecked());
  });
});

describe("labels", () => {
  it("names each checkbox by its short line", () => {
    const card = cardOf();
    render(<ClientCard card={card} />);
    for (const row of card.rows) {
      expect(screen.getByRole("checkbox", { name: row.shortLine })).toBeInTheDocument();
    }
  });

  it("shows the client name, occasion and brief", () => {
    const card = cardOf();
    render(<ClientCard card={card} />);
    expect(screen.getByRole("heading", { name: card.client.name })).toBeInTheDocument();
    expect(screen.getByText(card.occasion)).toBeInTheDocument();
    expect(screen.getByText(`“${card.brief}”`)).toBeInTheDocument();
  });
});

describe("reroll controls", () => {
  it("shows none without onReroll", () => {
    render(<ClientCard card={cardOf("easy", true)} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.queryByText("Fixed")).not.toBeInTheDocument();
  });

  it("shows one named button per direction, except Burlap only which says Fixed", () => {
    const card = cardOf("easy", true);
    render(<ClientCard card={card} onReroll={noop} />);
    expect(screen.getAllByRole("button")).toHaveLength(card.rows.length - 1);
    expect(screen.queryByRole("button", { name: /burlap/i })).not.toBeInTheDocument();
    expect(screen.getByText("Fixed")).toBeInTheDocument();
    expect(screen.getByText("Modifier")).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "Burlap only" })).toBeInTheDocument();
    for (const row of card.rows.slice(1)) {
      expect(screen.getByRole("button", { name: `Reroll: ${row.shortLine}` })).toBeInTheDocument();
    }
  });

  it("calls onReroll with the row's real slot", () => {
    const card = cardOf("easy", true);
    const onReroll = vi.fn();
    render(<ClientCard card={card} onReroll={onReroll} />);
    const row = card.rows[2];
    fireEvent.click(screen.getByRole("button", { name: `Reroll: ${row.shortLine}` }));
    expect(onReroll).toHaveBeenCalledWith(row.slot);
    expect(row.slot).toBe(2);
  });

  it("keeps the real slot when an earlier slot is empty", () => {
    const base = challenge("medium");
    const gapped = {
      ...base,
      directions: base.directions.map((direction, i) => (i === 0 ? null : direction)),
    };
    const card = cardFor(gapped);
    const onReroll = vi.fn();
    render(<ClientCard card={card} onReroll={onReroll} />);
    fireEvent.click(screen.getAllByRole("button")[0]);
    expect(onReroll).toHaveBeenCalledWith(1);
  });
});

describe("after a reroll", () => {
  it("clears the rerolled row's tick and keeps the others", () => {
    const before = challenge("medium");
    const { rerender } = render(<ClientCard card={cardFor(before)} onReroll={noop} />);
    boxes().forEach((box) => fireEvent.click(box));
    const after = reroll(before, 1);
    rerender(<ClientCard card={cardFor(after)} onReroll={noop} justRerolledSlot={1} />);
    const states = boxes().map((box) => (box as HTMLInputElement).checked);
    expect(states[1]).toBe(false);
    expect(states.filter(Boolean)).toHaveLength(states.length - 1);
  });

  it("announces the change politely and marks the new row", () => {
    const after = reroll(challenge("medium"), 1);
    const card = cardFor(after);
    render(<ClientCard card={card} onReroll={noop} justRerolledSlot={1} />);
    const status = screen
      .getAllByRole("status")
      .find((el) => (el.textContent ?? "").includes("swapped"))!;
    expect(status).toHaveTextContent("Direction 2 swapped for a new one.");
    expect(status).toHaveTextContent(`It is now ${card.rows[1].shortLine}.`);
    expect(screen.getByText("New direction")).toBeInTheDocument();
  });
});

describe("accessibility", () => {
  const cases: [string, () => ReturnType<typeof cardOf>][] = [
    ["short card", () => cardOf("easy")],
    ["long card", () => cardOf("chaos")],
    ["Burlap card", () => cardOf("easy", true)],
  ];

  for (const [name, make] of cases) {
    for (const withReroll of [false, true]) {
      it(`has no axe violations: ${name}${withReroll ? " with reroll" : ""}`, async () => {
        const { container } = render(
          <ClientCard card={make()} onReroll={withReroll ? noop : undefined} />,
        );
        fireEvent.click(boxes()[0]);
        const results = await axe.run(container, {
          rules: { "color-contrast": { enabled: false } },
        });
        expect(results.violations).toEqual([]);
      });
    }
  }

  it("keeps the list items inside a labelled list", () => {
    render(<ClientCard card={cardOf()} />);
    const list = screen.getByRole("list", { name: "Directions" });
    expect(within(list).getAllByRole("listitem").length).toBeGreaterThan(1);
  });
});
