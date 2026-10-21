import { expect, test, type Page } from "@playwright/test";

import { expectNoSeriousA11yIssues } from "./axe";

const generate = (page: Page) => page.getByRole("button", { name: /^generate/i }).click();

async function tabToDial(page: Page) {
  const medium = page.getByRole("radio", { name: "Medium" });
  for (let press = 0; press < 12; press++) {
    await page.keyboard.press("Tab");
    if (await medium.evaluate((element) => element === document.activeElement)) return;
  }
}

test("generating on Medium shows a client card with 3 or 4 directions", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "No client yet" })).toBeVisible();
  await generate(page);
  const rows = page.getByRole("list").getByRole("listitem");
  await expect(page.getByRole("heading", { level: 2 })).toBeFocused();
  expect(await rows.count()).toBeGreaterThanOrEqual(3);
  expect(await rows.count()).toBeLessThanOrEqual(4);
});

test("the dial moves to Chaos with the arrow keys and generates 5 or 6 directions", async ({
  page,
}) => {
  await page.goto("/");
  await tabToDial(page);
  await expect(page.getByRole("radio", { name: "Medium" })).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("radio", { name: "Chaos" })).toBeChecked();
  await expect(page.getByText("5–6 directions")).toBeVisible();
  await generate(page);
  const rows = page.getByRole("list").getByRole("listitem");
  expect(await rows.count()).toBeGreaterThanOrEqual(5);
  expect(await rows.count()).toBeLessThanOrEqual(6);
});

test("ticking Burlap only makes a Burlap only card", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("checkbox", { name: "Burlap only" }).check();
  await generate(page);
  await expect(page.getByText("Modifier")).toBeVisible();
});

test("on mobile the controls collapse after generating and open again", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile");
  await page.goto("/");
  await generate(page);
  await expect(page.getByText("Medium · Burlap off")).toBeVisible();
  await expect(page.getByRole("radio", { name: "Chaos" })).toBeHidden();
  await page.getByRole("button", { name: "Tap to change" }).click();
  await expect(page.getByRole("radio", { name: "Chaos" })).toBeVisible();
  await page.getByRole("button", { name: "Keep current client" }).click();
  await expect(page.getByText("Medium · Burlap off")).toBeVisible();
});

test("on desktop the controls stay beside the card", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop");
  await page.goto("/");
  await generate(page);
  await expect(page.getByRole("radio", { name: "Chaos" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Tap to change" })).toBeHidden();
});

test("the empty state and a generated card have no serious accessibility issues", async ({
  page,
}) => {
  await page.goto("/");
  await expectNoSeriousA11yIssues(page, "empty generator");
  await generate(page);
  await expectNoSeriousA11yIssues(page, "generated card");
});

test("rerolling a ticked direction changes it, clears its tick and keeps the other tick", async ({
  page,
}) => {
  await page.goto("/");
  await generate(page);
  const rows = page.getByRole("list").getByRole("listitem");
  const ticks = page.getByRole("list").getByRole("checkbox");
  await ticks.nth(0).check();
  await ticks.nth(1).check();
  const before = await rows.nth(1).locator("label").textContent();
  const reroll = rows.nth(1).getByRole("button", { name: /^reroll/i });
  await reroll.click();
  await expect(ticks.nth(1)).not.toBeChecked();
  await expect(rows.nth(1).locator("label")).not.toHaveText(before ?? "");
  await expect(ticks.nth(0)).toBeChecked();
  await expect(
    page.getByText("Direction 2 swapped for a new one.", { exact: false }),
  ).toBeVisible();
  await expectNoSeriousA11yIssues(page, "after a reroll");
});

test("a Chaos card has no reroll buttons", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("radio", { name: "Chaos" }).check({ force: true });
  await generate(page);
  await expect(page.getByRole("button", { name: /^reroll/i })).toHaveCount(0);
  await expect(page.getByText("Chaos cards can't be rerolled.")).toBeVisible();
});
