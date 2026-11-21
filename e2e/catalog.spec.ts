import { expect, test } from "@playwright/test";

test.describe("catalog", () => {
  test("browses category, product, item and detail with paging", async ({ page }) => {
    await page.goto("/catalog");
    await expect(page.getByRole("heading", { level: 1, name: "Catalog" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "Birds" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "Cats" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "Dogs" })).toHaveCount(0);
    await page.getByRole("link", { name: "Next" }).click();
    await expect(page).toHaveURL(/start=2/);
    await expect(page.getByRole("heading", { level: 2, name: "Dogs" })).toBeVisible();
    await page.getByRole("link", { name: "Fish" }).first().click();
    await expect(page.getByRole("heading", { level: 1, name: "Fish" })).toBeVisible();
    await page.getByRole("link", { name: /Angelfish/ }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Angelfish" })).toBeVisible();
    await page.getByRole("link", { name: /Large Angelfish/ }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Large Angelfish" })).toBeVisible();
    await expect(page.getByText("$16.50").first()).toBeVisible();
  });

  test("searches from the header: a match, no match and a blank query", async ({ page }) => {
    await page.goto("/catalog");
    const box = page.getByRole("searchbox", { name: "Search the catalog" });
    await box.fill("fish");
    await box.press("Enter");
    await expect(page).toHaveURL(/\/catalog\/search\?q=fish/);
    await expect(page.getByRole("heading", { level: 2, name: "Large Angelfish" })).toBeVisible();

    await page.getByRole("searchbox", { name: "Search the catalog" }).fill("unicorn");
    await page.getByRole("searchbox", { name: "Search the catalog" }).press("Enter");
    await expect(page.getByText("No pets match “unicorn”")).toBeVisible();

    await page.goto("/catalog/search?q=%20%20");
    await expect(page.getByText("Enter a keyword to search")).toBeVisible();
  });

  test("an unknown item shows the empty frame, not an error", async ({ page }) => {
    const response = await page.goto("/catalog/items/NOPE");
    expect(response?.status()).toBe(200);
    await expect(page.getByText("We couldn't find that")).toBeVisible();
  });

  test("reflows at 320 px without horizontal scrolling", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    for (const path of ["/catalog", "/catalog/items/EST-1", "/catalog/search?q=fish"]) {
      await page.goto(path);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      );
      expect(overflow).toBe(false);
    }
  });
});
