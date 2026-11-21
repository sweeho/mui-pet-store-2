import { expect, test, type Page } from "@playwright/test";

const rootPath = (baseURL: string | undefined) =>
  new URL(baseURL ?? "http://localhost").pathname.replace(/\/$/, "") + "/";

const samePath = (href: string, base: string, root: string) => {
  const p = new URL(href, base);
  return p.pathname.replace(/\/?$/, "/") === root;
};

/** Internal links in the landing page's main area, other than the landing page itself. */
async function primaryHrefs(page: Page, baseURL: string | undefined): Promise<string[]> {
  await page.goto("/");
  const root = rootPath(baseURL);
  const all = await page
    .getByRole("main")
    .getByRole("link")
    .evaluateAll((els) => els.map((e) => (e as HTMLAnchorElement).href));
  const origin = new URL(page.url()).origin;
  const hrefs = [
    ...new Set(
      all.filter((h) => h.startsWith(origin) && !samePath(h, page.url(), root)),
    ),
  ];
  expect(hrefs.length).toBeGreaterThan(0);
  return hrefs;
}

const emptyFrame = (page: Page) =>
  page.locator('[data-testid="empty-frame"], [data-state="empty"]').first();
const errorFrame = (page: Page) =>
  page.locator('[data-testid="error-frame"], [data-state="error"]').first();

test.describe("site-shell", () => {
  // case: SWHM3-C-0163@v1
  test("SWHM3-C-0163 root route shows landing page linking to all primary areas", async ({ page, baseURL }) => {
    await page.goto("/");
    await expect(page.getByRole("main").getByRole("heading", { level: 1 }).first()).toBeVisible();
    // every primary area reachable from the global navigation is also linked from the landing page
    const navHrefs = await page
      .getByRole("navigation")
      .first()
      .getByRole("link")
      .evaluateAll((els) => els.map((e) => (e as HTMLAnchorElement).href));
    const root = rootPath(baseURL);
    const origin = new URL(page.url()).origin;
    const areas = navHrefs.filter((h) => h.startsWith(origin) && !samePath(h, page.url(), root));
    const landing = await primaryHrefs(page, baseURL);
    expect(landing.length).toBeGreaterThanOrEqual(2);
    for (const a of areas) expect(landing).toContain(a);
  });

  // case: SWHM3-C-0164@v1
  test("SWHM3-C-0164 global navigation with landing-page link on every page", async ({ page, baseURL }) => {
    const root = rootPath(baseURL);
    for (const href of ["/", ...(await primaryHrefs(page, baseURL))]) {
      await page.goto(href);
      const nav = page.getByRole("navigation").first();
      await expect(nav).toBeVisible();
      const links = await nav.getByRole("link").evaluateAll((els) => els.map((e) => (e as HTMLAnchorElement).href));
      const homeIdx = links.findIndex((h) => samePath(h, page.url(), root));
      expect(homeIdx).toBeGreaterThanOrEqual(0);
      await nav.getByRole("link").nth(homeIdx).click();
      await expect(page).toHaveURL((u) => u.pathname.replace(/\/?$/, "/") === root);
      await expect(page.getByRole("main").getByRole("heading", { level: 1 }).first()).toBeVisible();
    }
  });

  // case: SWHM3-C-0165@v1
  test("SWHM3-C-0165 page content renders inside shared header, navigation and footer", async ({ page, baseURL }) => {
    for (const href of ["/", ...(await primaryHrefs(page, baseURL))]) {
      await page.goto(href);
      const header = page.getByRole("banner").first();
      const nav = page.getByRole("navigation").first();
      const main = page.getByRole("main").first();
      const footer = page.getByRole("contentinfo").first();
      await expect(header).toBeVisible();
      await expect(nav).toBeVisible();
      await expect(main).toBeVisible();
      await expect(footer).toBeVisible();
      const [h, n, m, f] = await Promise.all([
        header.boundingBox(),
        nav.boundingBox(),
        main.boundingBox(),
        footer.boundingBox(),
      ]);
      // content sits below the header and above the footer, without overlap
      expect(m!.y).toBeGreaterThanOrEqual(h!.y + h!.height - 1);
      expect(f!.y).toBeGreaterThanOrEqual(m!.y + m!.height - 1);
      // navigation is a sibling of the content: it must not overlap main horizontally
      const overlapsX = n!.x < m!.x + m!.width - 1 && m!.x < n!.x + n!.width - 1;
      const overlapsY = n!.y < m!.y + m!.height - 1 && m!.y < n!.y + n!.height - 1;
      expect(overlapsX && overlapsY).toBe(false);
      // content is rendered in the main landmark of the shell
      expect(((await main.innerText()) ?? "").trim().length).toBeGreaterThan(0);
    }
  });

  // case: SWHM3-C-0166@v1
  test("SWHM3-C-0166 page with no data renders shared empty frame", async ({ page, baseURL }) => {
    const hrefs = await primaryHrefs(page, baseURL);
    await page.route("**/api/**", (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: "[]" }),
    );
    for (const href of hrefs) {
      await page.goto(href);
      await expect(emptyFrame(page)).toBeVisible();
    }
  });

  // case: SWHM3-C-0167@v1
  test("SWHM3-C-0167 page load failure renders shared error frame with retry", async ({ page, baseURL }) => {
    const hrefs = await primaryHrefs(page, baseURL);
    let failing = true;
    await page.route("**/api/**", (route) =>
      failing
        ? route.fulfill({ status: 500, contentType: "application/json", body: '{"error":"boom"}' })
        : route.continue(),
    );
    for (const href of hrefs) {
      failing = true;
      await page.goto(href);
      await expect(errorFrame(page)).toBeVisible();
      const retry = page.getByRole("button", { name: /retry|try again/i }).first();
      await expect(retry).toBeVisible();
      failing = false;
      await retry.click();
      await expect(errorFrame(page)).toBeHidden();
    }
  });
});
