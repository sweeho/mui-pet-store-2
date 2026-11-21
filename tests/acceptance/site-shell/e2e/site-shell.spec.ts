import { expect, test, type Page } from "@playwright/test";

const AREAS = [/localization/i, /order administration|orders/i];

async function primaryHrefs(page: Page): Promise<string[]> {
  await page.goto("/");
  const hrefs: string[] = [];
  for (const name of AREAS) {
    const href = await page.getByRole("link", { name }).first().getAttribute("href");
    expect(href).toBeTruthy();
    hrefs.push(href as string);
  }
  return hrefs;
}

test.describe("site-shell", () => {
  // case: SWHM3-C-0163@v1
  test("SWHM3-C-0163 root route shows landing page linking to all primary areas", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    for (const name of AREAS) {
      await expect(page.getByRole("main").getByRole("link", { name }).first()).toBeVisible();
    }
  });

  // case: SWHM3-C-0164@v1
  test("SWHM3-C-0164 global navigation with landing-page link on every page", async ({ page }) => {
    for (const href of ["/", ...(await primaryHrefs(page))]) {
      await page.goto(href);
      const nav = page.getByRole("navigation").first();
      await expect(nav).toBeVisible();
      const home = nav.locator('a[href="/"]').first();
      await expect(home).toBeVisible();
      await home.click();
      await expect(page).toHaveURL(/\/$/);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    }
  });

  // case: SWHM3-C-0165@v1
  test("SWHM3-C-0165 page content renders inside shared header, navigation and footer", async ({ page }) => {
    for (const href of ["/", ...(await primaryHrefs(page))]) {
      await page.goto(href);
      const header = page.getByRole("banner");
      const nav = page.getByRole("navigation").first();
      const main = page.getByRole("main");
      const footer = page.getByRole("contentinfo");
      await expect(header).toBeVisible();
      await expect(nav).toBeVisible();
      await expect(main).toBeVisible();
      await expect(footer).toBeVisible();
      const [h, m, f] = await Promise.all([header.boundingBox(), main.boundingBox(), footer.boundingBox()]);
      expect(h!.y).toBeLessThan(m!.y + 1);
      expect(f!.y).toBeGreaterThanOrEqual(m!.y);
    }
  });

  // case: SWHM3-C-0166@v1
  test("SWHM3-C-0166 page with no data renders shared empty frame", async ({ page }) => {
    const [href] = await primaryHrefs(page);
    await page.route("**/api/**", (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: "[]" }),
    );
    await page.goto(href);
    await expect(page.getByTestId("empty-frame")).toBeVisible();
  });

  // case: SWHM3-C-0167@v1
  test("SWHM3-C-0167 page load failure renders shared error frame with retry", async ({ page }) => {
    const [href] = await primaryHrefs(page);
    let failing = true;
    await page.route("**/api/**", (route) =>
      failing
        ? route.fulfill({ status: 500, contentType: "application/json", body: '{"error":"boom"}' })
        : route.continue(),
    );
    await page.goto(href);
    await expect(page.getByTestId("error-frame")).toBeVisible();
    const retry = page.getByRole("button", { name: /retry|try again/i });
    await expect(retry).toBeVisible();
    failing = false;
    await retry.click();
    await expect(page.getByTestId("error-frame")).toBeHidden();
  });
});
