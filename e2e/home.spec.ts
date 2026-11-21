import { expect, test } from "@playwright/test";

/**
 * UI / E2E TEST
 *
 * The landing page and the rail in a real browser: layout, the links, the menu button on a small
 * screen.
 */
test.describe("Landing page and navigation", () => {
  test("[SWHM3-C-0163] the landing page links to every primary area", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const main = page.getByRole("main");
    await expect(main.getByRole("link", { name: /Language/ })).toHaveAttribute("href", /\/locale$/);
    await expect(main.getByRole("link", { name: /Order administration/ })).toHaveAttribute(
      "href",
      /\/admin\/orders$/,
    );
  });

  test("[SWHM3-C-0164] the rail links home from another page", async ({ page }) => {
    await page.goto("/locale");

    await page.getByRole("navigation").getByRole("link", { name: "Home" }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("[SWHM3-C-0165] a missing page renders inside the shell", async ({ page }) => {
    await page.goto("/no-such-page");

    await expect(page.getByRole("banner")).toBeVisible();
    await expect(page.getByRole("navigation")).toBeVisible();
    await expect(page.getByRole("contentinfo")).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Page not found");
  });

  test("opens the rail from the menu button on a small screen", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");

    await expect(page.getByRole("link", { name: "Home" })).not.toBeVisible();
    await page.getByRole("button", { name: "Open the menu" }).click();
    await expect(page.getByRole("link", { name: "Home" })).toBeVisible();
  });
});
