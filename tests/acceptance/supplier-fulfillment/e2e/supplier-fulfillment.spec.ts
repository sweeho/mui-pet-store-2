/**
 * Acceptance specs for capability supplier-fulfillment (browser level).
 *
 * Contract: the inventory page is /admin/inventory behind the form sign-in at /admin (fields labelled
 * Username and Password, button "Sign in"). Accounts: administrator jps_admin/admin, plain user j2ee/j2ee.
 * Each inventory row shows the item id, its current quantity (in a spinbutton-less cell with the text of the
 * number), a checkbox labelled "Update" and a number input labelled "New quantity". The form has an
 * "Update" submit button named "Update inventory". A non-administrator sees text "not authorised".
 */
import { expect, test, type Page } from "@playwright/test";

async function signIn(page: Page, user: string, password: string) {
  await page.goto("/admin");
  await page.getByLabel(/^username$/i).fill(user);
  await page.getByLabel(/^password$/i).fill(password);
  await page.getByRole("button", { name: /sign in/i }).click();
}

test.describe("supplier-fulfillment", () => {
  // case: SWHM3-C-0188@v1
  test("SWHM3-C-0188 update with negative quantity is ignored", async ({ page }) => {
    await signIn(page, "jps_admin", "admin");
    await page.goto("/admin/inventory");
    const row = page.getByRole("row").nth(1);
    const before = await row.innerText();
    await row.getByLabel(/^update$/i).check();
    await row.getByLabel(/^new quantity$/i).fill("-3");
    await page.getByRole("button", { name: /update inventory/i }).click();
    await page.goto("/admin/inventory");
    expect(await page.getByRole("row").nth(1).innerText()).toBe(before);
  });

  // case: SWHM3-C-0199@v1
  test("SWHM3-C-0199 non-administrator is denied the inventory page", async ({ page }) => {
    await signIn(page, "j2ee", "j2ee");
    await page.goto("/admin/inventory");
    await expect(page.getByText(/not authori[sz]ed/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /update inventory/i })).toHaveCount(0);
    const res = await page.request.post("/admin/inventory", { form: { itemId: "EST-1", update: "on", quantity: "5" } });
    expect(res.status() >= 300 || /not authori[sz]ed/i.test(await res.text())).toBe(true);
  });
});
