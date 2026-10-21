import { expect, test } from "@playwright/test";

import { expectNoSeriousA11yIssues } from "./axe";

const GOOD_LINK = "/c?v=1&s=k7m2qx9a&d=medium";
const BAD_LINKS = [
  "/c?s=k7m2qx9a&d=medium",
  "/c?v=1&s=nope&d=medium",
  "/c?v=1&s=k7m2qx9a&d=chaos&r=0",
];

test("a shared link opens to its card and passes axe", async ({ page }) => {
  await page.goto(GOOD_LINK);
  await expect(
    page.getByRole("heading", { level: 1, name: "Someone sent you a client" }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "Freya Lindqvist" })).toBeVisible();
  await expect(page.getByText("No flowers", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: /reroll/i })).toHaveCount(0);
  await expectNoSeriousA11yIssues(page, GOOD_LINK);
});

test("a shared link with Burlap only and a reroll shows the rerolled direction", async ({
  page,
}) => {
  await page.goto("/c?v=1&s=k7m2qx9a&d=medium&m=burlap&r=1");
  await expect(page.getByText("Burlap only")).toBeVisible();
  await expect(page.getByText("No bells")).toBeVisible();
});

test("make your own goes to the generator", async ({ page }) => {
  await page.goto(GOOD_LINK);
  await page.getByRole("link", { name: "Make your own" }).click();
  await expect(page).toHaveURL("/");
});

for (const link of BAD_LINKS) {
  test(`${link} shows the error page`, async ({ page }) => {
    await page.goto(link);
    await expect(
      page.getByRole("heading", { level: 1, name: "We couldn’t read this link" }),
    ).toBeVisible();
    await page.getByRole("link", { name: "Make a new one" }).click();
    await expect(page).toHaveURL("/");
    await expect(page.getByRole("heading", { level: 1, name: "Generator" })).toBeVisible();
  });
}

test("the error page passes axe", async ({ page }) => {
  await page.goto(BAD_LINKS[0] ?? "");
  await expectNoSeriousA11yIssues(page, "bad link");
});
