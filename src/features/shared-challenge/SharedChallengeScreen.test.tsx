import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useNavigate } from "react-router";
import { describe, expect, it } from "vitest";

import { cardFor } from "@/domain/card";
import { generate } from "@/domain/generate";
import { reroll } from "@/domain/reroll";
import { shareLinkFor, type ShareLinkProblem } from "@/links/share-link";

import { SharedChallengeScreen } from "./SharedChallengeScreen";

const SEED = "k7m2qx9a";

const challengeFor = (modifiers: "burlap"[] = []) =>
  generate({ seed: SEED, difficulty: "medium", modifiers, dataVersion: 1 });

function renderAt(url: string) {
  return render(
    <MemoryRouter initialEntries={[url]}>
      <Routes>
        <Route path="/c" element={<SharedChallengeScreen />} />
        <Route path="/" element={<p>Generator page</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

const BAD_LINKS: Record<ShareLinkProblem, { query: string; reason: RegExp }> = {
  missingVersion: { query: "s=k7m2qx9a&d=easy", reason: /version of Tailor-Made we don’t/ },
  unknownVersion: { query: "v=2&s=k7m2qx9a&d=easy", reason: /version of Tailor-Made we don’t/ },
  repeatedParameter: { query: "v=1&v=1&s=k7m2qx9a&d=easy", reason: /missing or changed/ },
  badSeed: { query: "v=1&s=nope&d=easy", reason: /client code in this link is damaged/ },
  unknownDifficulty: { query: "v=1&s=k7m2qx9a&d=brutal", reason: /missing or changed/ },
  unknownModifier: { query: "v=1&s=k7m2qx9a&d=easy&m=silk", reason: /missing or changed/ },
  repeatedModifier: {
    query: "v=1&s=k7m2qx9a&d=easy&m=burlap.burlap",
    reason: /missing or changed/,
  },
  badRerolls: { query: "v=1&s=k7m2qx9a&d=easy&r=x", reason: /missing or changed/ },
  chaosRerolled: { query: "v=1&s=k7m2qx9a&d=chaos&r=0", reason: /Chaos cards can’t be rerolled/ },
};

describe("SharedChallengeScreen", () => {
  it("shows the same client and short lines as the challenge's card", () => {
    const challenge = challengeFor();
    const card = cardFor(challenge);
    renderAt(shareLinkFor(challenge));
    expect(
      screen.getByRole("heading", { level: 1, name: "Someone sent you a client" }),
    ).toBeVisible();
    expect(screen.getByRole("heading", { level: 2, name: card.client.name })).toBeVisible();
    for (const row of card.rows) expect(screen.getByText(row.shortLine)).toBeVisible();
    expect(screen.queryByRole("button", { name: /reroll/i })).not.toBeInTheDocument();
  });

  it("shows the Modifier row for a Burlap only link and no Fixed label", () => {
    renderAt(shareLinkFor(challengeFor(["burlap"])));
    expect(screen.getByText("Burlap only")).toBeVisible();
    expect(screen.getByText("Modifier")).toBeVisible();
    expect(screen.queryByText("Fixed")).not.toBeInTheDocument();
  });

  it("shows the rerolled direction", () => {
    const start = challengeFor();
    const rerolled = reroll(start, 0);
    const before = cardFor(start).rows[0]?.shortLine ?? "";
    const after = cardFor(rerolled).rows[0]?.shortLine ?? "";
    expect(after).not.toBe(before);
    renderAt(shareLinkFor(rerolled));
    expect(screen.getByText(after)).toBeVisible();
    expect(screen.queryByText(before)).not.toBeInTheDocument();
  });

  it("links to the generator from make your own", () => {
    renderAt(shareLinkFor(challengeFor()));
    expect(screen.getByRole("link", { name: "Make your own" })).toHaveAttribute("href", "/");
  });

  for (const [problem, { query, reason }] of Object.entries(BAD_LINKS)) {
    it(`shows the error page for ${problem}`, () => {
      renderAt(`/c?${query}`);
      expect(
        screen.getByRole("heading", { level: 1, name: "We couldn’t read this link" }),
      ).toBeVisible();
      expect(screen.getByText(reason)).toBeVisible();
      expect(screen.getByRole("link", { name: "Make a new one" })).toHaveAttribute("href", "/");
    });
  }

  it("goes to the generator from make a new one", () => {
    renderAt("/c?v=9");
    fireEvent.click(screen.getByRole("link", { name: "Make a new one" }));
    expect(screen.getByText("Generator page")).toBeVisible();
  });

  it("reads the link again when the query changes", () => {
    function Jump() {
      const navigate = useNavigate();
      return (
        <button type="button" onClick={() => void navigate(shareLinkFor(challengeFor()))}>
          Jump
        </button>
      );
    }
    render(
      <MemoryRouter initialEntries={["/c?v=9"]}>
        <Jump />
        <Routes>
          <Route path="/c" element={<SharedChallengeScreen />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByText("Link problem")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Jump" }));
    expect(screen.queryByText("Link problem")).not.toBeInTheDocument();
    expect(screen.getByText("Someone sent you a client")).toBeVisible();
  });
});
