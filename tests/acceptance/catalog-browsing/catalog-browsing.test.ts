/**
 * @jest-environment node
 *
 * Acceptance tests for capability catalog-browsing.
 *
 * Contract the product must provide: `@/lib/catalog-browsing` exports
 *   createCatalog(opts?) -> catalog          (fresh store; opts.pageSize defaults to 2)
 *   createFrontController({ mappings }) -> { handle(path) -> Promise<{ mapping, screen, result }> }
 *     mappings = { [name]: { action: () => string | Promise<string>, screens: { [resultCode]: screenName } } }
 *     handle resolves the last path segment of a request ending in .do (extension removed) to a mapping,
 *     runs its action and returns the screen the result code maps to.
 *   resolveScreen(resultCode, screens) -> string   unmapped code is used as the screen name;
 *     an empty/undefined code throws an Error whose message contains "Screen not found"
 *   createFragmentCache({ clock: () => number (ms) }) -> { render(key, ttlSeconds, renderFn) -> Promise<string> }
 *   runCatalogCheck({ tablesExist: () => Promise<boolean>, requestPopulation: () => Promise<void> })
 *     -> Promise<{ exitCode: number }>   (population requested once if missing, checks re-run once)
 * catalog (all methods async):
 *   addCategory({ id, details: { [locale]: { name, description } } })
 *   addProduct({ id, categoryId, details: { [locale]: { name, description } } })
 *   addItem({ id, productId, details: { [locale]: { listPrice, unitCost, image, description, attr1..attr5 } } })
 *     rejects when a code is longer than 10 chars or duplicated, or a required detail field is missing
 *   details(kind: "category"|"product"|"item", code, locale) -> record | null
 *   ownership(itemId) -> { productId, categoryId }
 *   listCategories({ locale, start?, size? }); listProducts(categoryId, {...}); listItems(productId, {...})
 *   searchItems(query, { locale, start?, size? })
 *     -> Page = { items, hasNext, hasPrevious }   (an offset beyond the data gives an empty page)
 *   getItem(itemId, locale) -> { id, productId, categoryId, name, image, description,
 *     attr1..attr5, listPrice, unitCost } | null      (null, never an error, when absent)
 */
import {
  createCatalog,
  createFragmentCache,
  createFrontController,
  resolveScreen,
  runCatalogCheck,
} from "@/lib/catalog-browsing";

type Catalog = ReturnType<typeof createCatalog>;

const itemDetail = (over: Record<string, unknown> = {}) => ({
  listPrice: 10.5, unitCost: 7.25, image: "img.gif", description: "desc",
  attr1: "a1", attr2: "a2", attr3: "a3", attr4: "a4", attr5: "a5", ...over,
});
const en = (name: string, description = name) => ({ en_US: { name, description } });

async function seedProductWithItems(catalog: Catalog, n: number, opts: { productId?: string; pageSize?: number } = {}) {
  const productId = opts.productId ?? "P1";
  await catalog.addCategory({ id: "C1", details: en("Fish") });
  await catalog.addProduct({ id: productId, categoryId: "C1", details: en("Angelfish") });
  for (let i = 1; i <= n; i++) {
    await catalog.addItem({ id: `I${i}`, productId, details: { en_US: itemDetail({ description: `item ${i}` }) } });
  }
}
const ids = (page: { items: { id: string }[] }) => page.items.map((i) => i.id);

describe("catalog-browsing", () => {
  // case: SWHM3-C-0218@v1
  it("SWHM3-C-0218 item detail without list price rejected", async () => {
    const catalog = createCatalog();
    await catalog.addCategory({ id: "C1", details: en("Fish") });
    await catalog.addProduct({ id: "P1", categoryId: "C1", details: en("Angelfish") });
    await expect(
      catalog.addItem({ id: "I1", productId: "P1", details: { en_US: itemDetail({ listPrice: undefined }) } }),
    ).rejects.toThrow();
  });

  // case: SWHM3-C-0219@v1
  it("SWHM3-C-0219 catalog entities have unique codes up to 10 chars and localized details", async () => {
    const catalog = createCatalog();
    await catalog.addCategory({ id: "CAT", details: en("Fish") });
    await catalog.addProduct({ id: "PROD", categoryId: "CAT", details: en("Angelfish") });
    await catalog.addItem({ id: "ITEM", productId: "PROD", details: { en_US: itemDetail() } });
    await expect(catalog.addCategory({ id: "ABCDEFGHIJK", details: en("Long") })).rejects.toThrow();
    await expect(catalog.addCategory({ id: "CAT", details: en("Dup") })).rejects.toThrow();
    await expect(catalog.addProduct({ id: "PROD", categoryId: "CAT", details: en("Dup") })).rejects.toThrow();
    await expect(catalog.addItem({ id: "ITEM", productId: "PROD", details: { en_US: itemDetail() } })).rejects.toThrow();
    await expect(catalog.details("category", "CAT", "en_US")).resolves.toMatchObject({ name: "Fish" });
    await expect(catalog.details("product", "PROD", "en_US")).resolves.toMatchObject({ name: "Angelfish" });
    await expect(catalog.details("item", "ITEM", "en_US")).resolves.toMatchObject({ listPrice: 10.5 });
    await expect(catalog.details("category", "CAT", "ja_JP")).resolves.toBeNull();
  });

  // case: SWHM3-C-0220@v1
  it("SWHM3-C-0220 offset paging reports next/previous; start 9 empty", async () => {
    const catalog = createCatalog({ pageSize: 2 });
    await seedProductWithItems(catalog, 5);
    const page = await catalog.listItems("P1", { locale: "en_US", start: 2 });
    expect(page.items).toHaveLength(2);
    expect(page.hasNext).toBe(true);
    expect(page.hasPrevious).toBe(true);
    const beyond = await catalog.listItems("P1", { locale: "en_US", start: 9 });
    expect(beyond.items).toHaveLength(0);
  });

  // case: SWHM3-C-0221@v1
  it("SWHM3-C-0221 missing catalog tables trigger repopulation and one re-check", async () => {
    let populated = false;
    const tablesExist = jest.fn(async () => populated);
    const requestPopulation = jest.fn(async () => {
      populated = true;
    });
    await runCatalogCheck({ tablesExist, requestPopulation });
    expect(requestPopulation).toHaveBeenCalledTimes(1);
    expect(tablesExist).toHaveBeenCalledTimes(2);
  });

  // case: SWHM3-C-0222@v1
  it("SWHM3-C-0222 unconfigured result code used as screen name", () => {
    expect(resolveScreen("custom", { ok: "ok.jsp" })).toBe("custom");
    expect(resolveScreen("ok", { ok: "ok.jsp" })).toBe("ok.jsp");
    expect(() => resolveScreen(undefined as unknown as string, {})).toThrow(/Screen not found/);
  });

  // case: SWHM3-C-0223@v1
  it("SWHM3-C-0223 front controller resolves .do request to mapping and screen", async () => {
    const action = jest.fn(() => "success");
    const controller = createFrontController({
      mappings: { viewCategory: { action, screens: { success: "category.jsp" } } },
    });
    const outcome = await controller.handle("/petstore/shop/viewCategory.do");
    expect(action).toHaveBeenCalledTimes(1);
    expect(outcome).toMatchObject({ mapping: "viewCategory", screen: "category.jsp" });
  });

  // case: SWHM3-C-0224@v1
  it("SWHM3-C-0224 item belongs to one product which belongs to one category", async () => {
    const catalog = createCatalog();
    await seedProductWithItems(catalog, 1);
    await expect(catalog.ownership("I1")).resolves.toEqual({ productId: "P1", categoryId: "C1" });
  });

  // case: SWHM3-C-0225@v1
  it("SWHM3-C-0225 categories ordered by name with page size 2", async () => {
    const catalog = createCatalog();
    for (const [id, name] of [["C3", "Dogs"], ["C1", "Birds"], ["C2", "Cats"]]) {
      await catalog.addCategory({ id, details: en(name) });
    }
    const page = await catalog.listCategories({ locale: "en_US", start: 0, size: 2 });
    expect(page.items.map((c: { name: string }) => c.name)).toEqual(["Birds", "Cats"]);
  });

  // case: SWHM3-C-0226@v1
  it("SWHM3-C-0226 unknown item id yields no result without error", async () => {
    const catalog = createCatalog();
    await seedProductWithItems(catalog, 1);
    await expect(catalog.getItem("NOPE", "en_US")).resolves.toBeNull();
    await expect(catalog.getItem("I1", "ja_JP")).resolves.toBeNull();
  });

  // case: SWHM3-C-0227@v1
  it("SWHM3-C-0227 Japanese locale uses only Japanese detail record", async () => {
    const catalog = createCatalog();
    await catalog.addCategory({ id: "C1", details: { ...en("Fish"), ja_JP: { name: "魚", description: "魚類" } } });
    await catalog.addProduct({
      id: "P1", categoryId: "C1",
      details: { ...en("Angelfish"), ja_JP: { name: "エンゼルフィッシュ", description: "日本語" } },
    });
    const page = await catalog.listProducts("C1", { locale: "ja_JP" });
    expect(page.items).toHaveLength(1);
    expect(page.items[0]).toMatchObject({ name: "エンゼルフィッシュ", description: "日本語" });
    expect(JSON.stringify(page.items[0])).not.toContain("Angelfish");
  });

  // case: SWHM3-C-0228@v1
  it("SWHM3-C-0228 fragment cached 60s is re-rendered after 61s", async () => {
    let now = 1_000_000;
    const cache = createFragmentCache({ clock: () => now });
    const renderFn = jest.fn(async () => "<div/>");
    await cache.render("frag", 60, renderFn);
    await cache.render("frag", 60, renderFn);
    expect(renderFn).toHaveBeenCalledTimes(1);
    now += 61_000;
    await cache.render("frag", 60, renderFn);
    expect(renderFn).toHaveBeenCalledTimes(2);
  });

  // case: SWHM3-C-0229@v1
  it("SWHM3-C-0229 listings return only rows with description in shopper locale", async () => {
    const catalog = createCatalog({ pageSize: 10 });
    await catalog.addCategory({ id: "C1", details: { ...en("Fish"), ja_JP: { name: "魚", description: "魚" } } });
    await catalog.addCategory({ id: "C2", details: en("Dogs") });
    await catalog.addProduct({ id: "P1", categoryId: "C1", details: { ...en("Angelfish"), ja_JP: { name: "エンゼル", description: "x" } } });
    await catalog.addProduct({ id: "P2", categoryId: "C1", details: en("Shark") });
    await catalog.addItem({ id: "I1", productId: "P1", details: { en_US: itemDetail(), ja_JP: itemDetail() } });
    await catalog.addItem({ id: "I2", productId: "P1", details: { en_US: itemDetail() } });
    const cats = await catalog.listCategories({ locale: "ja_JP" });
    expect(ids(cats)).toEqual(["C1"]);
    const prods = await catalog.listProducts("C1", { locale: "ja_JP" });
    expect(ids(prods)).toEqual(["P1"]);
    const items = await catalog.listItems("P1", { locale: "ja_JP" });
    expect(ids(items)).toEqual(["I1"]);
  });

  // case: SWHM3-C-0230@v1
  it("SWHM3-C-0230 products listed by name: Ant before Zebra", async () => {
    const catalog = createCatalog({ pageSize: 10 });
    await catalog.addCategory({ id: "C1", details: en("Fish") });
    await catalog.addProduct({ id: "P1", categoryId: "C1", details: en("Zebra") });
    await catalog.addProduct({ id: "P2", categoryId: "C1", details: en("Ant") });
    const page = await catalog.listProducts("C1", { locale: "en_US" });
    expect(page.items.map((p: { name: string }) => p.name)).toEqual(["Ant", "Zebra"]);
  });

  // case: SWHM3-C-0231@v1
  it('SWHM3-C-0231 search "FISH bird" matches either keyword in pages', async () => {
    const catalog = createCatalog({ pageSize: 2 });
    await catalog.addCategory({ id: "C1", details: en("Animals") });
    await catalog.addProduct({ id: "PF", categoryId: "C1", details: en("Goldfish") });
    await catalog.addProduct({ id: "PB", categoryId: "C1", details: en("Bird") });
    await catalog.addProduct({ id: "PD", categoryId: "C1", details: en("Dog") });
    for (const [i, p] of [["I1", "PF"], ["I2", "PF"], ["I3", "PB"], ["I4", "PD"]]) {
      await catalog.addItem({ id: i, productId: p, details: { en_US: itemDetail() } });
    }
    const first = await catalog.searchItems("FISH bird", { locale: "en_US", start: 0 });
    expect(first.items).toHaveLength(2);
    expect(first.hasNext).toBe(true);
    const second = await catalog.searchItems("FISH bird", { locale: "en_US", start: 2 });
    expect([...ids(first), ...ids(second)].sort()).toEqual(["I1", "I2", "I3"]);
  });

  // case: SWHM3-C-0232@v1
  it("SWHM3-C-0232 whitespace-only query returns empty page", async () => {
    const catalog = createCatalog();
    await seedProductWithItems(catalog, 3);
    const page = await catalog.searchItems("   ", { locale: "en_US" });
    expect(page.items).toHaveLength(0);
  });

  // case: SWHM3-C-0233@v1
  it("SWHM3-C-0233 list price below unit cost accepted", async () => {
    const catalog = createCatalog();
    await catalog.addCategory({ id: "C1", details: en("Fish") });
    await catalog.addProduct({ id: "P1", categoryId: "C1", details: en("Angelfish") });
    await expect(
      catalog.addItem({ id: "I1", productId: "P1", details: { en_US: itemDetail({ listPrice: 1, unitCost: 5 }) } }),
    ).resolves.not.toThrow();
  });

  // case: SWHM3-C-0234@v1
  it("SWHM3-C-0234 item detail exposes all attributes", async () => {
    const catalog = createCatalog();
    await seedProductWithItems(catalog, 1);
    const item = await catalog.getItem("I1", "en_US");
    expect(item).toMatchObject({
      id: "I1", productId: "P1", categoryId: "C1", name: "Angelfish", image: "img.gif", description: "item 1",
      attr1: "a1", attr2: "a2", attr3: "a3", attr4: "a4", attr5: "a5", listPrice: 10.5, unitCost: 7.25,
    });
  });

  // case: SWHM3-C-0235@v1
  it("SWHM3-C-0235 default page size lists two items per page", async () => {
    const catalog = createCatalog();
    await seedProductWithItems(catalog, 5);
    const page = await catalog.listItems("P1", { locale: "en_US" });
    expect(page.items).toHaveLength(2);
  });

  // case: SWHM3-C-0236@v1
  it("SWHM3-C-0236 configured page size 2 yields pages of 2, 2, 1", async () => {
    const catalog = createCatalog({ pageSize: 2 });
    await seedProductWithItems(catalog, 5);
    const sizes: number[] = [];
    for (const start of [0, 2, 4]) {
      sizes.push((await catalog.listItems("P1", { locale: "en_US", start })).items.length);
    }
    expect(sizes).toEqual([2, 2, 1]);
  });
});
