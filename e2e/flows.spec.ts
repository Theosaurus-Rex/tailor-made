import { expect, test } from "@playwright/test";

import { cardContent, copyLink, directionRows, generate, stubClipboard, ticks } from "./helpers";

test.beforeEach(async ({ page }) => {
  await stubClipboard(page);
});

test("generate, tick, reroll, copy the link and open it: the shared card matches", async ({
  page,
}) => {
  await page.goto("/");
  await generate(page);
  await ticks(page).nth(0).check();
  await ticks(page).nth(1).check();

  const before = await cardContent(page);
  await directionRows(page)
    .nth(1)
    .getByRole("button", { name: /^reroll/i })
    .click();
  await expect(ticks(page).nth(1)).not.toBeChecked();
  await expect(ticks(page).nth(0)).toBeChecked();
  const after = await cardContent(page);
  expect(after.rows[1]?.[0]).not.toBe(before.rows[1]?.[0]);
  expect(after.rows[0]).toEqual(before.rows[0]);
  expect(after.rows.slice(2)).toEqual(before.rows.slice(2));

  const link = await copyLink(page);
  await page.goto(link);
  await expect(
    page.getByRole("heading", { level: 1, name: "Someone sent you a client" }),
  ).toBeVisible();
  expect(await cardContent(page)).toEqual(after);
});

test("a Burlap only link opens with Burlap only first, tagged Modifier", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("checkbox", { name: "Burlap only" }).check();
  await generate(page);
  const generated = await cardContent(page);
  await expect(directionRows(page).first().getByText("Modifier")).toBeVisible();

  const link = await copyLink(page);
  expect(link).toContain("m=burlap");
  await page.goto(link);
  await expect(directionRows(page).first().getByText("Modifier")).toBeVisible();
  expect(await cardContent(page)).toEqual(generated);
});

test("a Chaos card cannot be rerolled but its link still works", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("radio", { name: "Chaos" }).check({ force: true });
  await generate(page);
  await expect(page.getByRole("button", { name: /^reroll/i })).toHaveCount(0);
  await expect(page.getByText("Chaos cards can't be rerolled.")).toBeVisible();
  const generated = await cardContent(page);

  const link = await copyLink(page);
  await page.goto(link);
  await expect(page.getByRole("button", { name: /^reroll/i })).toHaveCount(0);
  expect(await cardContent(page)).toEqual(generated);
});
