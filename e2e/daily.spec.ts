import { expect, test } from "@playwright/test";

import { expectNoSeriousA11yIssues } from "./axe";
import { dailyCardFor } from "./domain";

test("the daily page shows today's client and rolls over at UTC midnight", async ({ page }) => {
  await page.clock.install({ time: new Date("2026-10-21T23:59:55Z") });
  await page.goto("/daily");
  await expect(page.getByRole("heading", { level: 1, name: "Today’s client" })).toBeVisible();
  await expect(page.getByText("Wednesday 21 October 2026")).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 2, name: dailyCardFor("2026-10-21").client.name }),
  ).toBeVisible();
  await expect(page.getByText("00:00:05")).toBeVisible();
  await expect(page.getByRole("button", { name: /reroll/i })).toHaveCount(0);
  await expectNoSeriousA11yIssues(page, "daily");

  await page.clock.fastForward(10_000);
  await expect(page.getByText("Thursday 22 October 2026")).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 2, name: dailyCardFor("2026-10-22").client.name }),
  ).toBeVisible();
  await expect(page.getByText(/^23:59:5\d$/)).toBeVisible();
});
