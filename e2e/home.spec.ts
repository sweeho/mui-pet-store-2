import { expect, test } from "@playwright/test";

/**
 * UI / E2E TEST
 *
 * Drives the real app in a real browser. Use it for what only a browser can show: the shell's
 * layout, the sidebar on a small screen, the page and its data together.
 */
test.describe("Home page", () => {
  test("greets the world inside the shell, with a row from the database", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { level: 1 })).toContainText("Hello, world");
    // One row through the database (the definition of done).
    await expect(page.getByTestId("first-user")).toContainText("First user: John Doe");
    await expect(page.getByRole("link", { name: "Home" })).toBeVisible();
  });

  test("opens the sidebar from the menu button on a small screen", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");

    await expect(page.getByRole("link", { name: "Home" })).not.toBeVisible();
    await page.getByRole("button", { name: "Open the menu" }).click();
    await expect(page.getByRole("link", { name: "Home" })).toBeVisible();
  });
});
