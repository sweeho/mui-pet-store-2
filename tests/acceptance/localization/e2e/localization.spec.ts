/**
 * Acceptance specs for capability localization (browser level).
 *
 * Contract:
 *  - /locale is the locale selection screen: radio buttons labelled "US English" (value en_US),
 *    "German" (de_DE), "Japanese" (ja_JP), "Simplified Chinese" (zh_CN) and a button "Change language".
 *    The form sends the selected code as the parameter "locale" to /api/locale (any method).
 *  - GET /api/session returns {id, locale, attributes: [names of the session's attributes]}.
 *  - A locale-change link is GET /locale-link?locale=<code>&referring_screen=<screen>
 *    &<cacheId>_attribute_<key>=<Base64 of the JSON-encoded value>. It restores each attribute to the
 *    session and shows the referring screen, a page whose root element carries data-screen="<screen>",
 *    with <html lang> set to the new locale's language.
 */
import { expect, test } from "@playwright/test";

test.describe("localization", () => {
  // case: SWHM3-C-0006@v1
  test("SWHM3-C-0006 locale selection screen lists four languages and submit control", async ({ page }) => {
    await page.goto("/locale");
    const radios = page.getByRole("radio");
    await expect(radios).toHaveCount(4);
    for (const [name, code] of [
      ["US English", "en_US"],
      ["German", "de_DE"],
      ["Japanese", "ja_JP"],
      ["Simplified Chinese", "zh_CN"],
    ]) {
      await expect(page.getByRole("radio", { name })).toHaveAttribute("value", code);
    }
    await expect(page.getByRole("button", { name: "Change language" })).toBeVisible();
  });

  // case: SWHM3-C-0007@v1
  test("SWHM3-C-0007 submitting Japanese sends ja_JP as locale", async ({ page }) => {
    await page.goto("/locale");
    await page.getByRole("radio", { name: "Japanese" }).check();
    const sent = page.waitForRequest((req) => new URL(req.url()).pathname.endsWith("/api/locale"));
    await page.getByRole("button", { name: "Change language" }).click();
    const req = await sent;
    const url = new URL(req.url());
    const body = new URLSearchParams(req.postData() ?? "");
    expect(url.searchParams.get("locale") ?? body.get("locale")).toBe("ja_JP");
  });

  // case: SWHM3-C-0011@v1
  test("SWHM3-C-0011 locale-change link restores state and referring screen", async ({ page }) => {
    const value = Buffer.from(JSON.stringify("kept-note"), "utf8").toString("base64");
    const params = new URLSearchParams({
      locale: "ja_JP",
      referring_screen: "main",
      cache1_attribute_note: value,
    });
    await page.goto(`/locale-link?${params.toString()}`);
    await expect(page.locator('[data-screen="main"]')).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("lang", /^ja/);
    const session = await (await page.request.get("/api/session")).json();
    expect(session.attributes).toContain("note");
    expect(session.locale).toBe("ja_JP");
  });
});
