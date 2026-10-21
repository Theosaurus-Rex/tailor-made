import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { cardFor } from "@/domain/card";
import { dailyChallenge } from "@/domain/daily";
import { shareLinkFor } from "@/links/share-link";

import { DailyScreen } from "./DailyScreen";

const DAY = "2026-10-21";

function renderAt(moment: string) {
  vi.setSystemTime(new Date(moment));
  return render(
    <MemoryRouter>
      <DailyScreen />
    </MemoryRouter>,
  );
}

const nameOf = (date: string) => cardFor(dailyChallenge(date)).client.name;

describe("DailyScreen", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows the client for the UTC date, with ticks and no reroll buttons", () => {
    renderAt(`${DAY}T10:00:00Z`);
    expect(screen.getByRole("heading", { level: 1, name: "Today’s client" })).toBeVisible();
    expect(screen.getByRole("heading", { level: 2, name: nameOf(DAY) })).toBeVisible();
    expect(screen.getAllByRole("checkbox").length).toBeGreaterThan(0);
    expect(screen.queryByRole("button", { name: /reroll/i })).toBeNull();
  });

  it("shows the full UTC date and the day's difficulty", () => {
    renderAt(`${DAY}T10:00:00Z`);
    expect(screen.getByText("Wednesday 21 October 2026")).toBeVisible();
    expect(screen.getByText(dailyChallenge(DAY).difficulty)).toBeVisible();
  });

  it("links to the day's challenge with its data version", () => {
    renderAt(`${DAY}T10:00:00Z`);
    expect(screen.getByRole("link", { name: "Link to today’s client" })).toHaveAttribute(
      "href",
      shareLinkFor(dailyChallenge(DAY)),
    );
  });

  it("uses the UTC day just before UTC midnight, whatever the local zone", () => {
    vi.stubEnv("TZ", "Pacific/Auckland");
    renderAt(`${DAY}T23:59:50Z`);
    expect(screen.getByRole("heading", { level: 2, name: nameOf(DAY) })).toBeVisible();
    vi.unstubAllEnvs();
  });
});
