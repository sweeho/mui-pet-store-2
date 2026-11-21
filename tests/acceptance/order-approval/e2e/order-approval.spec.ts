/**
 * Acceptance specs for capability order-approval (browser level).
 *
 * Contract: admin sign-in at /admin (fields labelled Username and Password, button "Sign in"),
 * administrator jps_admin/admin. The order tool /admin/orders lists pending orders, each row with
 * an "Approve" and a "Deny" button, and has a "Save" button that commits all decisions of the
 * batch in one request (one non-GET request carrying every decision). The saved batch is sent on as
 * an order-approval message, which is processed: afterwards the decided orders are no longer
 * listed as PENDING at /admin/orders.
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

    // Pin three specific rows once (element handles), so a row changing its text or leaving the
    // list after a click cannot shift which row the next click lands on.
    const handles = await page.getByRole("row").filter({ hasText: "PENDING" }).elementHandles();
    expect(handles.length).toBeGreaterThanOrEqual(3);
    const rows = handles.slice(0, 3);
    // Each row's order identifier: the first token containing a digit in its text.
    const ids = await Promise.all(
      rows.map(async (row) => {
        const text = (await row.textContent()) ?? "";
        const m = text.match(/[A-Za-z0-9-]*\d[A-Za-z0-9-]*/);
        return m ? m[0] : "";
      }),
    );
    for (const id of ids) expect(id).not.toBe("");
    expect(new Set(ids).size).toBe(3);

    const clickIn = async (i: number, name: RegExp) => {
      const button = await rows[i].$(`xpath=.//button[contains(translate(normalize-space(.), 'ADENPROV', 'adenprov'), '${name.source}')]`);
      expect(button).not.toBeNull();
      await button!.click();
    };
    await clickIn(0, /approve/);
    await clickIn(1, /approve/);
    await clickIn(2, /deny/);

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
    // Decision per order: the first decision word after each order's id.
    const body = writes[0].body;
    const decisionOf = (id: string) => {
      const at = body.indexOf(id);
      expect(at).toBeGreaterThanOrEqual(0);
      return body.slice(at).match(/APPROVED|DENIED/)?.[0];
    };
    expect(decisionOf(ids[0])).toBe("APPROVED");
    expect(decisionOf(ids[1])).toBe("APPROVED");
    expect(decisionOf(ids[2])).toBe("DENIED");

    // The message was sent and processed: each decided order has left the PENDING list.
    await expect
      .poll(
        async () => {
          await page.goto("/admin/orders");
          const pending = await page.getByRole("row").filter({ hasText: "PENDING" }).allTextContents();
          return ids.filter((id) => pending.some((t) => t.includes(id))).length;
        },
        { timeout: 15000 },
      )
      .toBe(0);
  });
});
