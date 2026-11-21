/**
 * Acceptance specs for capability order-administration (browser level).
 *
 * Contract: the admin entry point is /admin (form sign-in: fields labelled Username and Password,
 * button "Sign in"). Seeded accounts: administrator jps_admin/admin, plain user j2ee/j2ee. The
 * seed holds orders in PENDING, APPROVED, DENIED and COMPLETED. Admin home has controls named
 * "Manage orders" and "Log out"; the order tool is /admin/orders with a "Refresh" button, an
 * "Approve" button per pending order and table rows per order.
 */
import { expect, test, type Page } from "@playwright/test";

async function signIn(page: Page, user: string, password: string) {
  await page.goto("/admin");
  await page.getByLabel(/username/i).fill(user);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole("button", { name: /sign in/i }).click();
}
const asAdmin = (page: Page) => signIn(page, "jps_admin", "admin");

test.describe("order-administration", () => {
  // case: SWHM3-C-0097@v1
  test("SWHM3-C-0097 order tool lists orders with formatted fields and edit modes", async ({ page }) => {
    await asAdmin(page);
    await page.goto("/admin/orders");
    for (const status of ["PENDING", "APPROVED", "DENIED", "COMPLETED"]) {
      await expect(page.getByRole("row").filter({ hasText: status }).first()).toBeVisible();
    }
    const row = page.getByRole("row").filter({ hasText: "PENDING" }).first();
    await expect(row).toContainText(/\b\d{1,2}\/\d{1,2}\/\d{4}\b/);
    await expect(row.getByRole("button", { name: /approve/i })).toBeVisible();
    const done = page.getByRole("row").filter({ hasText: "COMPLETED" }).first();
    await expect(done.getByRole("button", { name: /approve/i })).toHaveCount(0);
  });

  // case: SWHM3-C-0098@v1
  test("SWHM3-C-0098 refresh with uncommitted decisions warns", async ({ page }) => {
    await asAdmin(page);
    await page.goto("/admin/orders");
    await page.getByRole("button", { name: /approve/i }).first().click();
    await page.getByRole("button", { name: /refresh/i }).click();
    await expect(page.getByRole("alertdialog").or(page.getByRole("dialog"))).toContainText(/uncommitted|confirm|unsaved/i);
  });

  // case: SWHM3-C-0102@v1
  test("SWHM3-C-0102 manage orders returns launch descriptor", async ({ page }) => {
    await asAdmin(page);
    const resp = page.waitForResponse((r) => /admin/.test(r.url()) && r.request().method() !== "GET" || /jnlp/i.test(r.headers()["content-type"] ?? ""));
    await page.getByRole("button", { name: /manage orders/i }).or(page.getByRole("link", { name: /manage orders/i })).click();
    const body = await (await resp).text();
    expect(body).toMatch(/jnlp/i);
    expect(body).toMatch(/server|host|codebase/i);
    expect(body).toMatch(/port/i);
    expect(body).toMatch(/session/i);
  });

  // case: SWHM3-C-0103@v1
  test("SWHM3-C-0103 log out ends session and shows logout page", async ({ page }) => {
    await asAdmin(page);
    await page.getByRole("button", { name: /log ?out/i }).or(page.getByRole("link", { name: /log ?out/i })).click();
    await expect(page.getByText(/logged out|logout|signed out/i).first()).toBeVisible();
    await page.goto("/admin");
    await expect(page.getByLabel(/username/i)).toBeVisible();
  });

  // case: SWHM3-C-0106@v1
  test("SWHM3-C-0106 non-administrator refused and sees sign-in form", async ({ page }) => {
    await signIn(page, "j2ee", "j2ee");
    await expect(page.getByRole("button", { name: /manage orders/i })).toHaveCount(0);
    await page.goto("/admin");
    await expect(page.getByLabel(/username/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
  });

  // case: SWHM3-C-0107@v1
  test("SWHM3-C-0107 administrator signs in and sees admin home", async ({ page }) => {
    await asAdmin(page);
    await expect(page.getByRole("button", { name: /manage orders/i }).or(page.getByRole("link", { name: /manage orders/i }))).toBeVisible();
    await expect(page.getByLabel(/password/i)).toHaveCount(0);
  });
});
