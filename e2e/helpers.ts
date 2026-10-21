import { expect, type Locator, type Page } from "@playwright/test";

export const generate = (page: Page) => page.getByRole("button", { name: /^generate/i }).click();

export const directionRows = (page: Page) =>
  page.getByRole("list", { name: "Directions" }).getByRole("listitem");

export const ticks = (page: Page) =>
  page.getByRole("list", { name: "Directions" }).getByRole("checkbox");

export async function cardContent(page: Page) {
  const name = await page.getByRole("heading", { level: 2 }).innerText();
  const rows = await directionRows(page).evaluateAll((items) =>
    items.map((item) => [
      item.querySelector("label")?.textContent ?? "",
      item.querySelector("p")?.textContent ?? "",
    ]),
  );
  return { name, rows };
}

export async function stubClipboard(page: Page, works = true) {
  await page.addInitScript((succeed) => {
    const store = window as unknown as { copied: string[] };
    store.copied = [];
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: (text: string) => {
          if (!succeed) return Promise.reject(new Error("denied"));
          store.copied.push(text);
          return Promise.resolve();
        },
      },
    });
  }, works);
}

export const lastCopied = (page: Page) =>
  page.evaluate(() => (window as unknown as { copied: string[] }).copied.at(-1) ?? "");

export async function copyLink(page: Page): Promise<string> {
  await page.getByRole("button", { name: "Copy link" }).click();
  await expect(page.getByRole("button", { name: /^Link copied/ })).toBeVisible();
  return lastCopied(page);
}

export async function tabTo(page: Page, target: Locator, limit = 60) {
  for (let press = 0; press < limit; press++) {
    await page.keyboard.press("Tab");
    if (await target.evaluate((element) => element === document.activeElement)) return;
  }
  throw new Error("never reached the target by keyboard");
}
