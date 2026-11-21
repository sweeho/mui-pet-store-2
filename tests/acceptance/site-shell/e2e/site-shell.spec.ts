import { expect, test, type Locator, type Page } from "@playwright/test";

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

// The cases name no marker: accept a test id or data-state, or a status/alert role, but only inside the
// main landmark (never the route announcer, nav or header) and only for the shell's own frame.
const emptyFrame = (page: Page) =>
  page
    .getByRole("main")
    .locator('[data-testid="empty-frame"], [data-state="empty"]')
    .or(
      page
        .getByRole("main")
        .getByRole("status")
        .filter({ hasText: /^\s*(no |nothing|empty)/i }),
    )
    .first();
const errorFrame = (page: Page) =>
  page
    .getByRole("main")
    .locator('[data-testid="error-frame"], [data-state="error"]')
    .or(page.getByRole("main").getByRole("alert"))
    .first();

/** A signature of the frame element, so every page can be shown to use the same one. */
const frameSignature = (loc: Locator) =>
  loc.evaluate((el) => `${el.getAttribute("data-testid") ?? ""}|${el.getAttribute("data-state") ?? ""}|${el.getAttribute("role") ?? ""}`);

/** Watch the page's own /api requests, so only pages that load data are judged. */
const trackApi = (page: Page) => {
  const seen = { count: 0 };
  page.on("request", (r) => {
    if (new URL(r.url()).pathname.includes("/api/")) seen.count++;
  });
  return seen;
};

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
    const seen = trackApi(page);
    let exercised = 0;
    const signatures = new Set<string>();
    for (const href of hrefs) {
      seen.count = 0;
      await page.goto(href);
      await page.waitForLoadState("networkidle");
      if (seen.count === 0) continue; // page has no data request, so no empty state to judge
      exercised++;
      await expect(emptyFrame(page)).toBeVisible();
      signatures.add(await frameSignature(emptyFrame(page)));
    }
    expect(exercised).toBeGreaterThan(0);
    // one shared frame: every page renders the same kind of element
    expect(signatures.size).toBe(1);
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
    const seen = trackApi(page);
    let exercised = 0;
    const signatures = new Set<string>();
    for (const href of hrefs) {
      failing = true;
      seen.count = 0;
      await page.goto(href);
      await page.waitForLoadState("networkidle");
      if (seen.count === 0) continue; // page has no data request, so no failure to judge
      exercised++;
      await expect(errorFrame(page)).toBeVisible();
      signatures.add(await frameSignature(errorFrame(page)));
      const retry = page.getByRole("main").getByRole("button", { name: /retry|try again/i }).first();
      await expect(retry).toBeVisible();
      failing = false;
      await retry.click();
      await expect(errorFrame(page)).toBeHidden();
    }
    expect(exercised).toBeGreaterThan(0);
    // one shared frame: every page renders the same kind of element
    expect(signatures.size).toBe(1);
  });
});
