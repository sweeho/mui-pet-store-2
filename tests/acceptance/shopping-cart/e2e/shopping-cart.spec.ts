/**
 * Acceptance specs for capability shopping-cart (browser level).
 *
 * Contract: the storefront lists products at /store, each with an "Add to cart" button; /cart shows
 * the shopper's session cart, and says "Your cart is empty" when it holds nothing. A cart belongs to
 * one browser session (cookie), so each browser context is a separate shopper.
 */
import { expect, test } from "@playwright/test";

test.describe("shopping-cart", () => {
  // case: SWHM3-C-0213@v1
  test("SWHM3-C-0213 new session shows empty cart", async ({ page }) => {
    await page.goto("/cart");
    await expect(page.getByText(/your cart is empty/i)).toBeVisible();
  });

  // case: SWHM3-C-0214@v1
  test("SWHM3-C-0214 shoppers' carts are separate", async ({ browser }) => {
    const one = await browser.newContext();
    const two = await browser.newContext();
    try {
      const p1 = await one.newPage();
      const p2 = await two.newPage();
      await p1.goto("/store");
      await p1.getByRole("button", { name: /add to cart/i }).first().click();
      await p1.goto("/cart");
      await expect(p1.getByText(/your cart is empty/i)).toHaveCount(0);
      await p2.goto("/cart");
      await expect(p2.getByText(/your cart is empty/i)).toBeVisible();
    } finally {
      await one.close();
      await two.close();
    }
  });
});
