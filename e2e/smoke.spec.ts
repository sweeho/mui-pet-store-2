import { expect, test } from "@playwright/test";

/**
 * SMOKE TEST
 *
 * Does the app boot at all: the page loads with nothing in the console, the API answers, and a
 * database-backed route answers. A suite that probed only the page and /api/hello would stay green
 * through a broken data layer.
 */
test("home page loads with no console errors", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });

  const response = await page.goto("/");

  expect(response?.ok()).toBe(true);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  expect(consoleErrors).toEqual([]);
});

test("the API responds", async ({ request }) => {
  const response = await request.get("/api/hello");
  expect(response.ok()).toBe(true);
});

test("a database-backed route responds", async ({ request }) => {
  const response = await request.get("/api/users");

  expect(response.ok()).toBe(true);
  expect(await response.json()).toHaveProperty("users");
});
