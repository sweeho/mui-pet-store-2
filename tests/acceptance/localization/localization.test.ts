/**
 * @jest-environment node
 *
 * Acceptance tests for capability localization.
 *
 * Contract the product must provide: `@/lib/localization` exports
 *   DEFAULT_LOCALE = "en_US"
 *   resolveLocale(chosen?: string | null) -> string          the chosen code, or DEFAULT_LOCALE when none
 *   serverDefaultLocale() -> Locale
 *   Locale = { language, country, code }                     e.g. { language: "ja", country: "JP", code: "ja_JP" }
 *   resolveCatalogLocale(text) -> Locale | null              "language_COUNTRY"; no underscore -> null
 *   parseLocaleCode(code) -> Locale | null                   "default" (any case) -> serverDefaultLocale(); null/"en" -> null
 *   orderEmailLocale(order: { locale }) -> Locale | null     "language_country" -> that locale
 *   formatNumber(value, locale, fractionDigits) -> string    locale given as a code such as "de_DE"
 *   formatCurrency(amount, locale, precision) -> string
 *   parseKeywords(text, locale) -> string[]                  split by the locale's word-break rules
 *   createLocalizationRuntime(opts?) -> Promise<rt>          (fresh store)
 *     opts.screens: { [locale]: { [screenName]: template } }  screen definitions per locale; default locale en_US
 *     opts.exceptionMappings: { [exceptionName]: screenName }
 * rt:
 *   rt.catalog.{addCategory({ id }), addProduct({ id, categoryId })}
 *   rt.catalog.{saveCategoryDetail({ categoryId, locale, name?, image?, description? }),
 *               saveProductDetail({ productId, locale, name?, image?, description? })}     reject when name or locale
 *               is missing, or when (entity, locale) already has a row; store nothing then
 *   rt.catalog.{categoryDetails(id), productDetails(id)} -> rows
 *   rt.sessions.{create() -> sessionId (no locale yet), get(sessionId) -> { locale }}
 *   rt.changeLocale(sessionId, code) -> Promise<{ ok: boolean, screen?: string, error?: Error }>
 *       success: session locale = code, controller state attribute "locale" = code, screen "locale-changed"
 *   rt.controllerState(sessionId) -> { locale?: string }
 *   rt.handle({ sessionId?, screen, params?, raise? }) -> Promise<{ status, sessionId, screen, localeUsed, html }>
 *       sets a missing session locale to the default; the screen locale is params.locale, else the session locale,
 *       else the default, and the default when that locale has no definitions; `raise` makes the request throw an
 *       exception of that name, routed through exceptionMappings (no mapping -> status 500);
 *       an unknown screen prints "Definition for screen <name> not found" in html
 *   rt.parseForm(rawBody: Buffer) -> Record<string, string>    application/x-www-form-urlencoded, UTF-8
 * `@/lib/shopping-cart` createCart({ catalog: (itemId, locale) => ... }) passes cart.locale as the 2nd argument,
 *   and cart.locale defaults to "en_US".
 */
import {
  DEFAULT_LOCALE,
  createLocalizationRuntime,
  formatCurrency,
  formatNumber,
  orderEmailLocale,
  parseKeywords,
  parseLocaleCode,
  resolveCatalogLocale,
  resolveLocale,
  serverDefaultLocale,
} from "@/lib/localization";
import { createCart } from "@/lib/shopping-cart";

const screens = {
  en_US: { main: "Welcome", "locale-changed": "Language changed" },
  ja_JP: { main: "ようこそ", "locale-changed": "言語を変更しました" },
};

describe("localization", () => {
  // case: SWHM3-C-0001@v1
  it("SWHM3-C-0001 ja_JP resolves to Japanese locale", () => {
    expect(resolveCatalogLocale("ja_JP")).toMatchObject({ language: "ja", country: "JP" });
  });

  // case: SWHM3-C-0002@v1
  it("SWHM3-C-0002 text without underscore yields no locale", () => {
    expect(resolveCatalogLocale("en")).toBeFalsy();
  });

  // case: SWHM3-C-0003@v1
  it("SWHM3-C-0003 1234.5 formats for de_DE with 2 fraction digits", () => {
    expect(formatNumber(1234.5, "de_DE", 2)).toBe("1.234,50");
  });

  // case: SWHM3-C-0004@v1
  it("SWHM3-C-0004 category detail without name is rejected", async () => {
    const rt = await createLocalizationRuntime();
    await rt.catalog.addCategory({ id: "C1" });
    await expect(rt.catalog.saveCategoryDetail({ categoryId: "C1", locale: "en_US" })).rejects.toBeDefined();
    expect(await rt.catalog.categoryDetails("C1")).toHaveLength(0);
  });

  // case: SWHM3-C-0005@v1
  it("SWHM3-C-0005 product detail with only name and locale is accepted", async () => {
    const rt = await createLocalizationRuntime();
    await rt.catalog.addCategory({ id: "C1" });
    await rt.catalog.addProduct({ id: "P1", categoryId: "C1" });
    await rt.catalog.saveProductDetail({ productId: "P1", locale: "en_US", name: "Angelfish" });
    const rows = await rt.catalog.productDetails("P1");
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ locale: "en_US", name: "Angelfish" });
  });

  // case: SWHM3-C-0008@v1
  it("SWHM3-C-0008 valid locale change records locale and shows success", async () => {
    const rt = await createLocalizationRuntime({ screens });
    const sessionId = await rt.sessions.create();
    const result = await rt.changeLocale(sessionId, "ja_JP");
    expect(result.ok).toBe(true);
    expect(result.screen).toBe("locale-changed");
    expect(rt.controllerState(sessionId).locale).toBe("ja_JP");
  });

  // case: SWHM3-C-0009@v1
  it("SWHM3-C-0009 mapped exception shows its mapped screen", async () => {
    const rt = await createLocalizationRuntime({
      screens: { en_US: { ...screens.en_US, "stock-error": "Out of stock" } },
      exceptionMappings: { StockError: "stock-error" },
    });
    const res = await rt.handle({ screen: "main", raise: "StockError" });
    expect(res.screen).toBe("stock-error");
    expect(res.html).toContain("Out of stock");
  });

  // case: SWHM3-C-0010@v1
  it("SWHM3-C-0010 unmapped exception returns server error", async () => {
    const rt = await createLocalizationRuntime({
      screens,
      exceptionMappings: { StockError: "stock-error" },
    });
    const res = await rt.handle({ screen: "main", raise: "UnknownProblem" });
    expect(res.status).toBe(500);
  });

  // case: SWHM3-C-0012@v1
  it("SWHM3-C-0012 known screen name renders its template", async () => {
    const rt = await createLocalizationRuntime({ screens });
    const res = await rt.handle({ screen: "main" });
    expect(res.status).toBe(200);
    expect(res.html).toContain("Welcome");
  });

  // case: SWHM3-C-0013@v1
  it("SWHM3-C-0013 unknown screen prints not-found message", async () => {
    const rt = await createLocalizationRuntime({ screens });
    const res = await rt.handle({ screen: "nowhere" });
    expect(res.html).toMatch(/Definition for screen .*nowhere.* not found/);
  });

  // case: SWHM3-C-0014@v1
  it("SWHM3-C-0014 order locale zh_CN yields Chinese (China) locale", () => {
    expect(orderEmailLocale({ locale: "zh_CN" })).toMatchObject({ language: "zh", country: "CN" });
  });

  // case: SWHM3-C-0015@v1
  it("SWHM3-C-0015 second en_US detail row for product is rejected", async () => {
    const rt = await createLocalizationRuntime();
    await rt.catalog.addCategory({ id: "C1" });
    await rt.catalog.addProduct({ id: "P1", categoryId: "C1" });
    await rt.catalog.saveProductDetail({ productId: "P1", locale: "en_US", name: "Angelfish" });
    await expect(
      rt.catalog.saveProductDetail({ productId: "P1", locale: "en_US", name: "Angelfish again" }),
    ).rejects.toBeDefined();
    const rows = await rt.catalog.productDetails("P1");
    expect(rows.filter((r: { locale: string }) => r.locale === "en_US")).toHaveLength(1);
  });

  // case: SWHM3-C-0016@v1
  it("SWHM3-C-0016 locale change with ja_JP sets session locale", async () => {
    const rt = await createLocalizationRuntime({ screens });
    const sessionId = await rt.sessions.create();
    await rt.changeLocale(sessionId, "ja_JP");
    expect(rt.sessions.get(sessionId).locale).toBe("ja_JP");
  });

  // case: SWHM3-C-0017@v1
  it("SWHM3-C-0017 locale change with invalid code fails and keeps locale", async () => {
    const rt = await createLocalizationRuntime({ screens });
    const first = await rt.handle({ screen: "main" });
    expect(rt.sessions.get(first.sessionId).locale).toBe("en_US");
    const result = await rt.changeLocale(first.sessionId, "xx");
    expect(result.ok).toBe(false);
    expect(rt.sessions.get(first.sessionId).locale).toBe("en_US");
  });

  // case: SWHM3-C-0018@v1
  it("SWHM3-C-0018 DEFAULT code parses to server default locale", () => {
    expect(parseLocaleCode("DEFAULT")).toEqual(serverDefaultLocale());
  });

  // case: SWHM3-C-0019@v1
  it("SWHM3-C-0019 null code and en are invalid", () => {
    expect(parseLocaleCode(null)).toBeFalsy();
    expect(parseLocaleCode("en")).toBeFalsy();
  });

  // case: SWHM3-C-0020@v1
  it("SWHM3-C-0020 request parameter locale overrides session locale", async () => {
    const rt = await createLocalizationRuntime({ screens });
    const first = await rt.handle({ screen: "main" });
    expect(first.localeUsed).toBe("en_US");
    const res = await rt.handle({ sessionId: first.sessionId, screen: "main", params: { locale: "ja_JP" } });
    expect(res.localeUsed).toBe("ja_JP");
    expect(res.html).toContain("ようこそ");
  });

  // case: SWHM3-C-0021@v1
  it("SWHM3-C-0021 unsupported locale falls back to default screens", async () => {
    const rt = await createLocalizationRuntime({ screens });
    const res = await rt.handle({ screen: "main", params: { locale: "fr_FR" } });
    expect(res.localeUsed).toBe("en_US");
    expect(res.html).toContain("Welcome");
  });

  // case: SWHM3-C-0022@v1
  it("SWHM3-C-0022 new cart defaults to US English for catalog lookup", async () => {
    const seen: unknown[] = [];
    const cart = createCart({
      catalog: (itemId: string, locale?: string) => {
        seen.push(locale);
        return { itemId, productId: "P1", category: "FISH", name: "Angelfish", attribute: "Large", unitCost: 10 };
      },
    } as Parameters<typeof createCart>[0]);
    await cart.add("A");
    await cart.list();
    expect(seen.length).toBeGreaterThan(0);
    expect(seen.every((l) => l === "en_US")).toBe(true);
  });

  // case: SWHM3-C-0023@v1
  it("SWHM3-C-0023 Japanese form post decoded as UTF-8", async () => {
    const rt = await createLocalizationRuntime();
    const body = Buffer.from(`text=${encodeURIComponent("日本語")}`, "utf8");
    const params = rt.parseForm(body);
    expect(params.text).toBe("日本語");
  });

  // case: SWHM3-C-0024@v1
  it("SWHM3-C-0024 first visit gets en_US session locale", async () => {
    const rt = await createLocalizationRuntime({ screens });
    const res = await rt.handle({ screen: "main" });
    expect(rt.sessions.get(res.sessionId).locale).toBe("en_US");
  });

  // case: SWHM3-C-0025@v1
  it("SWHM3-C-0025 default locale is en_US when none chosen", () => {
    expect(DEFAULT_LOCALE).toBe("en_US");
    expect(resolveLocale()).toBe("en_US");
    expect(resolveLocale(null)).toBe("en_US");
  });

  // case: SWHM3-C-0026@v1
  it("SWHM3-C-0026 currency formatted with exactly 2 fraction digits", () => {
    expect(formatCurrency(1234.5, "en_US", 2)).toBe("$1,234.50");
  });

  // case: SWHM3-C-0027@v1
  it("SWHM3-C-0027 search text split by locale word-break rules", () => {
    expect(parseKeywords("red, big fish!", "en_US")).toEqual(["red", "big", "fish"]);
    const ja = parseKeywords("私は猫が好き", "ja_JP");
    expect(ja.length).toBeGreaterThan(1);
    expect(ja.join("")).toBe("私は猫が好き");
  });
});
