import { test } from "@playwright/test";

import { expectNoSeriousA11yIssues } from "./axe";
import { directionRows, generate, stubClipboard, ticks } from "./helpers";

test("a Chaos card has no serious accessibility issues", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("radio", { name: "Chaos" }).check({ force: true });
  await generate(page);
  await expectNoSeriousA11yIssues(page, "chaos card");
});

test("a Burlap only card has no serious accessibility issues", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("checkbox", { name: "Burlap only" }).check();
  await generate(page);
  await expectNoSeriousA11yIssues(page, "burlap card");
});

test("a card with every direction ticked has no serious accessibility issues", async ({ page }) => {
  await page.goto("/");
  await generate(page);
  const count = await directionRows(page).count();
  for (let index = 0; index < count; index++) await ticks(page).nth(index).check();
  await page.getByText("Ready to hand over.").waitFor();
  await expectNoSeriousA11yIssues(page, "all ticked");
});

test("the Copy as text box has no serious accessibility issues", async ({ page }) => {
  await stubClipboard(page);
  await page.goto("/");
  await generate(page);
  await page.getByRole("button", { name: "Copy as text" }).click();
  await page.getByRole("textbox").waitFor();
  await expectNoSeriousA11yIssues(page, "copy as text");
});

test("the expanded mobile controls have no serious accessibility issues", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile");
  await page.goto("/");
  await generate(page);
  await page.getByRole("button", { name: "Tap to change" }).click();
  await page.getByRole("radio", { name: "Chaos" }).waitFor();
  await expectNoSeriousA11yIssues(page, "mobile controls expanded");
});

test("a shared Burlap card has no serious accessibility issues", async ({ page }) => {
  await page.goto("/c?v=1&s=k7m2qx9a&d=medium&m=burlap&r=1");
  await page.getByText("Modifier").waitFor();
  await expectNoSeriousA11yIssues(page, "shared burlap card");
});

test("a shared Chaos card has no serious accessibility issues", async ({ page }) => {
  await page.goto("/c?v=1&s=k7m2qx9a&d=chaos");
  await page.getByRole("heading", { level: 2 }).waitFor();
  await expectNoSeriousA11yIssues(page, "shared chaos card");
});

test("the daily page after rollover has no serious accessibility issues", async ({ page }) => {
  await page.clock.install({ time: new Date("2026-10-21T23:59:55Z") });
  await page.goto("/daily");
  await page.clock.fastForward(10_000);
  await page.getByText("Thursday 22 October 2026").waitFor();
  await expectNoSeriousA11yIssues(page, "daily after rollover");
});
