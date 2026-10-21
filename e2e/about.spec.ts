import { expect, test } from "@playwright/test";

test("about shows its heading, the data version and the credit link", async ({ page }) => {
  await page.goto("/about");
  await expect(page.getByRole("heading", { level: 1, name: "Tailor-Made" })).toBeVisible();
  await expect(page.getByText(/^v\d+$/)).toBeVisible();
  await expect(page.getByRole("link", { name: "dressmakerwiki.site" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "Disclaimer" })).toBeVisible();
});
