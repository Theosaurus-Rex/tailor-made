import { expect, test } from "@playwright/test";

import { expectNoSeriousA11yIssues } from "./axe";

const ROUTES = [
  { path: "/", heading: "Generator" },
  { path: "/daily", heading: "Today’s client" },
  { path: "/c", heading: "We couldn’t read this link" },
  { path: "/about", heading: "Tailor-Made" },
  { path: "/nope", heading: "Page not found" },
];

for (const { path, heading } of ROUTES) {
  test(`${path} shows its heading and has no serious accessibility issues`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible();
    await expectNoSeriousA11yIssues(page, path);
  });
}
