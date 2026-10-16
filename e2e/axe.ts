import AxeBuilder from "@axe-core/playwright";
import { expect, type Page } from "@playwright/test";

const BLOCKING_IMPACTS = new Set(["serious", "critical"]);

export async function expectNoSeriousA11yIssues(page: Page, label: string): Promise<void> {
  const { violations } = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();

  const report = violations
    .filter((v) => v.impact && BLOCKING_IMPACTS.has(v.impact))
    .map((v) => `${v.id} (${String(v.impact)}): ${v.help} [${String(v.nodes.length)} nodes]`);

  expect(report, `${label} has serious accessibility issues`).toEqual([]);
}
