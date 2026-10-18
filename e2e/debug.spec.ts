import { expect, test } from "@playwright/test";

test("/debug is not found in a production build", async ({ page }) => {
  await page.goto("/debug");
  await expect(page.getByRole("heading", { level: 1, name: "Page not found" })).toBeVisible();
});
