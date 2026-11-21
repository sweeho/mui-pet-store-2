/**
 * Acceptance specs for capability checkout-order-placement (browser level).
 *
 * Contract: the storefront lists products at /store, each with an "Add to cart" button; /cart has a
 * "Checkout" button. The shipping-information form at /checkout/shipping has fields labelled
 * "Street", "City", "State", "Zip", "Country" and a "Continue" button. A complete form continues to
 * /checkout/billing (billing validation); an incomplete form shows a "Missing form data" heading.
 * Sign-in is the form at /admin (fields labelled Username and Password, button "Sign in"; plain user
 * j2ee/j2ee). Placing the order (button "Place order" on /checkout/billing, once signed in) shows a
 * heading "Order <id>" and the bill-to e-mail address (the billing form has an "E-mail" field; the
 * confirmation shows exactly the address entered there), and the cart then shows "Your cart is empty".
 */
import { expect, test } from "@playwright/test";

async function signIn(page: import("@playwright/test").Page) {
  await page.goto("/admin");
  await page.getByLabel(/^username$/i).fill("j2ee");
  await page.getByLabel(/^password$/i).fill("j2ee");
  await page.getByRole("button", { name: /sign in/i }).click();
}

async function fillShipping(page: import("@playwright/test").Page, complete: boolean) {
  await page.goto("/checkout/shipping");
  if (complete) {
    await page.getByLabel(/^street$/i).fill("1 Main St");
    await page.getByLabel(/^city$/i).fill("Town");
    await page.getByLabel(/^state$/i).fill("CA");
    await page.getByLabel(/^zip$/i).fill("90001");
    await page.getByLabel(/^country$/i).fill("US");
  }
  await page.getByRole("button", { name: /^continue$/i }).click();
}

test.describe("checkout-order-placement", () => {
  // case: SWHM3-C-0033@v1
  test("SWHM3-C-0033 response returns order id and e-mail and empties cart", async ({ page }) => {
    await signIn(page);
    await page.goto("/store");
    await page.getByRole("button", { name: /add to cart/i }).first().click();
    await fillShipping(page, true);
    await expect(page).toHaveURL(/\/checkout\/billing/);
    const billTo = "bill.to@example.com";
    await page.getByLabel(/^e-?mail$/i).fill(billTo);
    await page.getByRole("button", { name: /^place order$/i }).click();
    // Exclude "Order summary"-style headings; the confirmation heading is "Order <id>" where the id has a digit.
    await expect(
      page.getByRole("heading", { name: /^order\s+(?!summary\b)\S*\d\S*$/i }).first(),
    ).toBeVisible();
    // The address may be repeated on the page; at least one visible occurrence is enough.
    await expect(page.getByText(billTo, { exact: false }).first()).toBeVisible();
    await page.goto("/cart");
    await expect(page.getByText(/your cart is empty/i)).toBeVisible();
  });

  // case: SWHM3-C-0068@v1
  test("SWHM3-C-0068 shipping step result 1 goes to billing validation", async ({ page }) => {
    await fillShipping(page, true);
    await expect(page).toHaveURL(/\/checkout\/billing/);
  });

  // case: SWHM3-C-0069@v1
  test("SWHM3-C-0069 shipping step result 2 shows missing-form-data screen", async ({ page }) => {
    await fillShipping(page, false);
    await expect(page.getByRole("heading", { name: /missing form data/i })).toBeVisible();
  });
});
