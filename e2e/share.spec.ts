import { expect, test } from "@playwright/test";

import { expectNoSeriousA11yIssues } from "./axe";
import { generate, stubClipboard } from "./helpers";

test.beforeEach(async ({ context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]).catch(() => undefined);
});

test("Copy link copies a link that opens the same client", async ({ page }) => {
  await page.goto("/");
  await generate(page);
  const name = await page.getByRole("heading", { level: 2 }).innerText();

  await page.getByRole("button", { name: "Copy link" }).click();
  await expect(page.getByRole("button", { name: /^Link copied/ })).toBeVisible();
  await expect(page.getByRole("status").filter({ hasText: "Link copied." })).toBeVisible();
  await expectNoSeriousA11yIssues(page, "after Copy link");

  const link = await page.evaluate(() => navigator.clipboard.readText()).catch(() => null);
  if (link === null) {
    test.skip(true, "clipboard cannot be read in this browser");
    return;
  }
  expect(link).toContain("/c?v=1&s=");
  await page.goto(link);
  await expect(page.getByRole("heading", { level: 2, name })).toBeVisible();
});

test("Copy as text confirms and shows what was copied", async ({ page }) => {
  await page.goto("/");
  await generate(page);
  const name = await page.getByRole("heading", { level: 2 }).innerText();

  await page.getByRole("button", { name: "Copy as text" }).click();
  await expect(page.getByRole("button", { name: /^Text copied/ })).toBeVisible();
  await expect(page.getByRole("textbox")).toHaveValue(new RegExp(`^${name} · `));
  await expectNoSeriousA11yIssues(page, "after Copy as text");
});

test("a refused clipboard shows the link to copy by hand", async ({ page }) => {
  await stubClipboard(page, false);
  await page.goto("/");
  await generate(page);
  await page.getByRole("button", { name: "Copy link" }).click();
  await expect(page.getByRole("button", { name: "Couldn’t copy" })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Copy the link by hand" })).toHaveValue(
    /\/c\?v=1&s=/,
  );
  await expectNoSeriousA11yIssues(page, "copy failed");
});
