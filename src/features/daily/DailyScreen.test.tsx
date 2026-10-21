import { act, render, screen } from "@testing-library/react";
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
    vi.stubEnv("TZ", "Pacific/Auckland");
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
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
    renderAt(`${DAY}T23:59:50Z`);
    expect(screen.getByRole("heading", { level: 2, name: nameOf(DAY) })).toBeVisible();
  });

  it("counts down to the next UTC midnight", () => {
    renderAt(`${DAY}T23:59:50Z`);
    expect(screen.getByText("00:00:10")).toBeVisible();
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(screen.getByText("00:00:07")).toBeVisible();
  });

  it("counts hours and minutes too", () => {
    renderAt(`${DAY}T17:17:50Z`);
    expect(screen.getByText("06:42:10")).toBeVisible();
  });

  it("shows the next day's client and restarts the countdown after midnight", () => {
    renderAt(`${DAY}T23:59:50Z`);
    act(() => {
      vi.advanceTimersByTime(11_000);
    });
    expect(screen.getByRole("heading", { level: 2, name: nameOf("2026-10-22") })).toBeVisible();
    expect(screen.getByText("Thursday 22 October 2026")).toBeVisible();
    expect(screen.getByText("23:59:59")).toBeVisible();
    expect(screen.getByRole("link", { name: "Link to today’s client" })).toHaveAttribute(
      "href",
      shareLinkFor(dailyChallenge("2026-10-22")),
    );
    expect(screen.getByText(dailyChallenge("2026-10-22").difficulty)).toBeVisible();
  });

  it("labels the countdown and keeps it out of live announcements", () => {
    renderAt(`${DAY}T10:00:00Z`);
    const time = screen.getByText("14:00:00");
    expect(time.tagName).toBe("TIME");
    expect(time).toHaveAccessibleName("Next client in");
    expect(time.closest("[aria-live]")).toHaveAttribute("aria-live", "off");
  });
});
