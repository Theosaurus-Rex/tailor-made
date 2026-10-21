import { expect, test } from "@playwright/test";

const LINKS = [
  { name: "Generate", path: "/", heading: "Generator" },
  { name: "Daily", path: "/daily", heading: "Daily challenge" },
  { name: "About", path: "/about", heading: "About" },
];

for (const { name, path, heading } of LINKS) {
  test(`the ${name} link opens ${path}`, async ({ page }) => {
    await page.goto(path === "/" ? "/about" : "/");
    await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name }).click();
    await expect(page).toHaveURL(path);
    await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible();
  });
}

test("the not found link returns to the generator", async ({ page }) => {
  await page.goto("/nope");
  await page.getByRole("link", { name: "Go to the generator" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Generator" })).toBeVisible();
});

test("the wordmark text shows from the desktop breakpoint up", async ({ page }, testInfo) => {
  await page.goto("/");
  const wordmark = page.getByTestId("wordmark");
  if (testInfo.project.name === "desktop") {
    await expect(wordmark).toBeVisible();
  } else {
    await expect(wordmark).toBeHidden();
    await expect(page.getByRole("link", { name: "Tailor-Made" })).toBeVisible();
  }
  await expect(
    page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "About" }),
  ).toBeVisible();
});
