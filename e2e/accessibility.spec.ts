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

  test("language page and confirmation", async ({ page }) => {
    await page.goto("/locale");
    await expect(page.getByRole("radio")).toHaveCount(4);
    await expectAccessibleStructure(page);
    await page.getByRole("button", { name: "Change language" }).click();
    await expect(page).toHaveURL(/\/locale\/changed/);
    await expectAccessibleStructure(page);
  });

  test("catalog pages", async ({ page }) => {
    for (const path of [
      "/catalog",
      "/catalog/categories/FISH",
      "/catalog/products/FI-SW-01",
      "/catalog/items/EST-1",
      "/catalog/search?q=fish",
      "/catalog/search?q=unicorn",
      "/catalog/items/NOPE",
    ]) {
      await page.goto(path);
      await expectAccessibleStructure(page);
    }
  });

  test("account pages", async ({ page }) => {
    for (const path of [
      "/signin",
      "/signup",
      "/signed-off",
      "/user-creation-error",
      "/user-creation-error?reason=duplicate&name=ann",
      "/customer",
    ]) {
      await page.goto(path);
      await expectAccessibleStructure(page);
    }
    const userName = `a${Date.now().toString(36)}`;
    await page.request.post("/api/customers", { data: { userName, password: "pw-a11y" } });
    await page.goto("/signin");
    await page.getByLabel(/^user name$/i).fill(userName);
    await page.getByLabel(/^password$/i).fill("pw-a11y");
    await page.getByRole("main").getByRole("button", { name: "Sign on" }).click();
    await expect(page).toHaveURL(/\/account\/welcome/);
    for (const path of ["/account/welcome", "/account/profile", "/customer"]) {
      await page.goto(path);
      await expectAccessibleStructure(page);
    }
  });

  test("empty frame", async ({ page }) => {
    // The order tool needs a signed-on customer until administrator roles arrive.
    const userName = `o${Date.now().toString(36)}`;
    await page.request.post("/api/customers", { data: { userName, password: "pw-a11y" } });
    await page.goto("/signin");
    await page.getByLabel(/^user name$/i).fill(userName);
    await page.getByLabel(/^password$/i).fill("pw-a11y");
    await page.getByRole("main").getByRole("button", { name: "Sign on" }).click();
    await expect(page).toHaveURL(/\/account\/welcome/);
    await page.goto("/admin/orders");
    await expectAccessibleStructure(page);
    await expect(page.getByText("No orders yet")).toBeVisible();
  });

  test("error frame announces itself and offers Try again", async ({ page }) => {
    await page.route("**/api/locales", (route) => route.fulfill({ status: 500, body: "{}" }));
    await page.goto("/locale");
    await expect(page.getByRole("alert")).toBeVisible();
    await expect(page.getByRole("button", { name: "Try again" })).toBeVisible();
    await expectAccessibleStructure(page);
  });

  test("loading frame announces a status", async ({ page }) => {
    await page.route("**/api/locales", () => undefined); // never answers
    await page.goto("/locale");
    await expect(page.getByRole("status")).toBeVisible();
    await expectAccessibleStructure(page);
  });
});
