import { expect, test, type Page } from "@playwright/test";

/**
 * A11Y-001: structural accessibility checks of the landing page and each shared frame. Every page
 * has the four landmarks, one h1, and every link and button has an accessible name.
 */
async function expectAccessibleStructure(page: Page) {
  await expect(page.getByRole("banner")).toHaveCount(1);
  await expect(page.getByRole("main")).toHaveCount(1);
  await expect(page.getByRole("contentinfo")).toHaveCount(1);
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  const unnamed = await page
    .locator("a:visible, button:visible")
    .evaluateAll(
      (els) =>
        els.filter((e) => !(e.textContent ?? "").trim() && !e.getAttribute("aria-label")).length,
    );
  expect(unnamed).toBe(0);
}

test.describe("accessibility", () => {
  test("landing page", async ({ page }) => {
    await page.goto("/");
    await expectAccessibleStructure(page);
  });

  test("empty frame", async ({ page }) => {
    await page.goto("/admin/orders");
    await expectAccessibleStructure(page);
    await expect(page.getByText("No orders yet")).toBeVisible();
  });

  test("error frame announces itself and offers Try again", async ({ page }) => {
    await page.route("**/api/locales", (route) => route.fulfill({ status: 500, body: "{}" }));
    await page.goto("/localization");
    await expect(page.getByRole("alert")).toBeVisible();
    await expect(page.getByRole("button", { name: "Try again" })).toBeVisible();
    await expectAccessibleStructure(page);
  });

  test("loading frame announces a status", async ({ page }) => {
    await page.route("**/api/locales", () => undefined); // never answers
    await page.goto("/localization");
    await expect(page.getByRole("status")).toBeVisible();
    await expectAccessibleStructure(page);
  });
});
