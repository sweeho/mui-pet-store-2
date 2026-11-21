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
      const addButton = p1.getByRole("button", { name: /add to cart/i }).first();
      // The product's own name: the first non-empty line of the card that holds the button.
      const cardText = await addButton
        .locator("xpath=ancestor::*[self::li or self::article or self::tr or contains(@class,'Card')][1]")
        .innerText();
      const productName = cardText
        .split("\n")
        .map((line) => line.trim())
        .find((line) => line !== "" && !/add to cart/i.test(line));
      expect(productName).toBeTruthy();
      await addButton.click();
      await p1.goto("/cart");
      await expect(p1.getByText(productName as string).first()).toBeVisible();
      await expect(p1.getByText(/your cart is empty/i)).toHaveCount(0);
      await p2.goto("/cart");
      await expect(p2.getByText(/your cart is empty/i)).toBeVisible();
    } finally {
      await one.close();
      await two.close();
    }
  });
});
