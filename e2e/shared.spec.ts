import { expect, test } from "@playwright/test";

import { expectNoSeriousA11yIssues } from "./axe";
import { sharedCardFor } from "./domain";

const GOOD_LINK = "/c?v=1&s=k7m2qx9a&d=medium";
const WITH_VERSION = "v=1&s=k7m2qx9a&d=medium";
const UNRECOGNISED = "This link was made with a version of Tailor-Made we don’t recognise.";
const CHANGED = "Part of this link is missing or changed.";
const BAD_LINKS = [
  { problem: "missingVersion", link: "/c?s=k7m2qx9a&d=medium", message: UNRECOGNISED },
  { problem: "unknownVersion", link: "/c?v=99&s=k7m2qx9a&d=medium", message: UNRECOGNISED },
  { problem: "repeatedParameter", link: `/c?${WITH_VERSION}&s=k7m2qx9a`, message: CHANGED },
  {
    problem: "badSeed",
    link: "/c?v=1&s=nope&d=medium",
    message: "The client code in this link is damaged.",
  },
  { problem: "unknownDifficulty", link: "/c?v=1&s=k7m2qx9a&d=nope", message: CHANGED },
  { problem: "unknownModifier", link: `/c?${WITH_VERSION}&m=silk`, message: CHANGED },
  { problem: "repeatedModifier", link: `/c?${WITH_VERSION}&m=burlap.burlap`, message: CHANGED },
  { problem: "badRerolls", link: `/c?${WITH_VERSION}&r=x`, message: CHANGED },
  { problem: "badRerolls (out of range)", link: `/c?${WITH_VERSION}&r=99`, message: CHANGED },
  {
    problem: "chaosRerolled",
    link: "/c?v=1&s=k7m2qx9a&d=chaos&r=0",
    message: "Chaos cards can’t be rerolled, so this link can’t be right.",
  },
];

test("a shared link opens to its card and passes axe", async ({ page }) => {
  await page.goto(GOOD_LINK);
  await expect(
    page.getByRole("heading", { level: 1, name: "Someone sent you a client" }),
  ).toBeVisible();
  const card = sharedCardFor(GOOD_LINK);
  await expect(page.getByRole("heading", { level: 2, name: card.client.name })).toBeVisible();
  await expect(page.getByText(card.rows[0]?.shortLine ?? "", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: /reroll/i })).toHaveCount(0);
  await expectNoSeriousA11yIssues(page, GOOD_LINK);
});

test("a shared link with Burlap only and a reroll shows the rerolled direction", async ({
  page,
}) => {
  const link = "/c?v=1&s=k7m2qx9a&d=medium&m=burlap&r=1";
  await page.goto(link);
  const rows = sharedCardFor(link).rows;
  expect(rows[0]?.isModifier).toBe(true);
  for (const row of rows) {
    await expect(page.getByText(row.shortLine, { exact: true })).toBeVisible();
  }
});

test("make your own goes to the generator", async ({ page }) => {
  await page.goto(GOOD_LINK);
  await page.getByRole("link", { name: "Make your own" }).click();
  await expect(page).toHaveURL("/");
});

for (const { problem, link, message } of BAD_LINKS) {
  test(`a ${problem} link shows the error page`, async ({ page }) => {
    await page.goto(link);
    await expect(
      page.getByRole("heading", { level: 1, name: "We couldn’t read this link" }),
    ).toBeVisible();
    await expect(page.getByText(message)).toBeVisible();
    await page.getByRole("link", { name: "Make a new one" }).click();
    await expect(page).toHaveURL("/");
    await expect(page.getByRole("heading", { level: 1, name: "Generator" })).toBeVisible();
  });
}

test("the error page passes axe", async ({ page }) => {
  await page.goto(BAD_LINKS[0]?.link ?? "");
  await expectNoSeriousA11yIssues(page, "bad link");
});
