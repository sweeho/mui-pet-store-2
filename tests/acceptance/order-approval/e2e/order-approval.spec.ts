/**
 * Acceptance specs for capability order-approval (browser level).
 *
 * Contract: admin sign-in at /admin (fields labelled Username and Password, button "Sign in"),
 * administrator jps_admin/admin. The order tool /admin/orders lists pending orders, each row with
 * an "Approve" and a "Deny" button, and has a "Save" button that commits all decisions of the
 * batch in one request (one non-GET request carrying every decision).
 */
import { expect, test } from "@playwright/test";

test.describe("order-approval", () => {
  // case: SWHM3-C-0279@v1
  test("SWHM3-C-0279 admin batch of decisions committed once and sent as message", async ({ page }) => {
    await page.goto("/admin");
    await page.getByLabel(/^username$/i).fill("jps_admin");
    await page.getByLabel(/^password$/i).fill("admin");
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.goto("/admin/orders");

    const pending = page.getByRole("row").filter({ hasText: "PENDING" });
    expect(await pending.count()).toBeGreaterThanOrEqual(3);

    await pending.nth(0).getByRole("button", { name: /approve/i }).click();
    await pending.nth(1).getByRole("button", { name: /approve/i }).click();
    await pending.nth(2).getByRole("button", { name: /deny/i }).click();

    const writes: { url: string; body: string }[] = [];
    page.on("request", (r) => {
      if (r.method() !== "GET" && r.method() !== "HEAD" && r.method() !== "OPTIONS") {
        writes.push({ url: r.url(), body: r.postData() ?? "" });
      }
    });
    await page.getByRole("button", { name: /save/i }).click();
    await expect.poll(() => writes.length).toBeGreaterThan(0);
    await page.waitForLoadState("networkidle");

    expect(writes).toHaveLength(1);
    expect(writes[0].body.match(/APPROVED/g) ?? []).toHaveLength(2);
    expect(writes[0].body.match(/DENIED/g) ?? []).toHaveLength(1);
  });
});
