import { and, asc, eq, or, sql, type SQL } from "drizzle-orm";
import path from "node:path";

import type { AppDb } from "@/db/client";
import * as schema from "@/db/schema";

import { parseKeywords, parseLocaleCode } from "./localization/locale";

/** The default page size (R-0008, R-0165, R-0166) and the largest a caller may ask for (API-104). */
export const DEFAULT_PAGE_SIZE = 2;
export const MAX_PAGE_SIZE = 50;
const MAX_START = 1_000_000_000;
/** A search looks at the first 200 characters of a query and its first 10 distinct keywords. */
const MAX_QUERY_LENGTH = 200;
const MAX_KEYWORDS = 10;

export type TextDetail = { name: string; description?: string; image?: string };
export type ItemDetailInput = {
  listPrice?: number;
  unitCost?: number;
  image?: string;
  description?: string;
  attr1?: string | null;
  attr2?: string | null;
  attr3?: string | null;
  attr4?: string | null;
  attr5?: string | null;
};
export type Page<T> = { items: T[]; hasNext: boolean; hasPrevious: boolean };
export type PageOptions = { locale: string; start?: number; size?: number };
export type CatalogOptions = { db?: AppDb; pageSize?: number };

export type CategoryRow = {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
};
export type ProductRow = CategoryRow & { categoryId: string };
export type ItemRow = {
  id: string;
  productId: string;
  categoryId: string;
  categoryName: string;
  name: string;
  image: string;
  description: string;
  attr1: string | null;
  attr2: string | null;
  attr3: string | null;
  attr4: string | null;
  attr5: string | null;
  listPrice: number;
  unitCost: number;
};

/** A catalog read failed (R-0054): the cause is logged, the caller gets this. */
export class CatalogSystemError extends Error {
  constructor(operation: string, options?: { cause: unknown }) {
    super(`Catalog data access failed: ${operation}`, options);
    this.name = "CatalogSystemError";
  }
}

const reject = (message: string): never => {
  throw new Error(message);
};

function checkCode(kind: string, code: string) {
  if (typeof code !== "string" || code.length < 1 || code.length > 10)
    reject(`A ${kind} code must be 1 to 10 characters`);
}

function checkLocale(locale: string) {
  if (!parseLocaleCode(locale)) reject(`Invalid locale ${locale}`);
}

const twoDecimals = (n: number) =>
  Number.isFinite(n) && Math.abs(n * 100 - Math.round(n * 100)) < 1e-6;

function checkTextDetails(kind: string, details: Record<string, TextDetail>) {
  const entries = Object.entries(details ?? {});
  if (entries.length === 0) reject(`A ${kind} needs at least one detail record`);
  for (const [locale, d] of entries) {
    checkLocale(locale);
    if (!d?.name) reject(`A ${kind} detail needs a name`);
  }
  return entries;
}

function checkItemDetails(details: Record<string, ItemDetailInput>) {
  const entries = Object.entries(details ?? {});
  if (entries.length === 0) reject("An item needs at least one detail record");
  for (const [locale, d] of entries) {
    checkLocale(locale);
    if (typeof d?.listPrice !== "number" || typeof d.unitCost !== "number")
      reject("An item detail needs a list price and a unit cost");
    if (!twoDecimals(d.listPrice as number) || !twoDecimals(d.unitCost as number))
      reject("Prices have at most two decimals");
    if (!d.image || !d.description) reject("An item detail needs an image and a description");
    for (const a of [d.attr1, d.attr2, d.attr3, d.attr4, d.attr5])
      if (a && a.length > 80) reject("An attribute has at most 80 characters");
  }
  return entries;
}

function windowOf(page: PageOptions, pageSize: number) {
  const size = Math.min(MAX_PAGE_SIZE, Math.max(1, Math.floor(page.size ?? pageSize)));
  const start = Math.floor(page.start ?? 0);
  // A start beyond any real catalog is an empty page, not a database error.
  return { size, start, valid: Number.isSafeInteger(start) && start >= 0 && start <= MAX_START };
}

const emptyPage = <T>(hasPrevious = false): Page<T> => ({ items: [], hasNext: false, hasPrevious });

function toPage<T>(rows: T[], size: number, start: number): Page<T> {
  return { items: rows.slice(0, size), hasNext: rows.length > size, hasPrevious: start > 0 };
}

const escapeLike = (s: string) => s.replace(/[\\%_]/g, (c) => `\\${c}`);

async function openMemoryDb(): Promise<AppDb> {
  const { createClient } = await import("@libsql/client");
  const { drizzle } = await import("drizzle-orm/libsql");
  const { migrate } = await import("drizzle-orm/libsql/migrator");
  const db = drizzle({ client: createClient({ url: ":memory:" }), schema });
  await migrate(db, {
    migrationsFolder: path.join(/* turbopackIgnore: true */ process.cwd(), "drizzle"),
  });
  return db;
}

/**
 * The catalog: categories, products and items with per-locale text, over the app database (pass
 * `{ db }`) or, with none, a fresh in-memory one. All access is Drizzle queries in this module.
 */
export function createCatalog(opts: CatalogOptions = {}) {
  const pageSize = opts.pageSize ?? DEFAULT_PAGE_SIZE;
  let dbPromise: Promise<AppDb> | undefined;
  const db = () => (dbPromise ??= opts.db ? Promise.resolve(opts.db) : openMemoryDb());

  /** Run a read; a failure is logged with its context and reported as a CatalogSystemError. */
  async function read<T>(operation: string, run: (d: AppDb) => Promise<T>): Promise<T> {
    try {
      return await run(await db());
    } catch (cause) {
      console.error("Catalog read failed", { operation, cause });
      throw new CatalogSystemError(operation, { cause });
    }
  }

  const {
    category: cat,
    product: prod,
    item,
    categoryDetails: cd,
    productDetails: pd,
    itemDetails: idt,
  } = schema;

  const itemSelect = {
    id: item.id,
    productId: item.productId,
    categoryId: prod.categoryId,
    categoryName: sql<string>`coalesce(${cd.name}, '')`,
    name: sql<string>`coalesce(${pd.name}, '')`,
    image: idt.image,
    description: idt.description,
    attr1: idt.attr1,
    attr2: idt.attr2,
    attr3: idt.attr3,
    attr4: idt.attr4,
    attr5: idt.attr5,
    listPrice: idt.listPrice,
    unitCost: idt.unitCost,
  };

  /** Items of one locale: the item's own detail row is required, its product's name is joined. */
  const itemsQuery = (d: AppDb, locale: string, where: SQL | undefined) =>
    d
      .select(itemSelect)
      .from(item)
      .innerJoin(prod, eq(prod.id, item.productId))
      .innerJoin(idt, and(eq(idt.itemId, item.id), eq(idt.locale, locale)))
      .leftJoin(pd, and(eq(pd.productId, prod.id), eq(pd.locale, locale)))
      .leftJoin(cd, and(eq(cd.categoryId, prod.categoryId), eq(cd.locale, locale)))
      .where(where)
      .orderBy(asc(item.id));

  return {
    async addCategory(c: { id: string; details: Record<string, TextDetail> }): Promise<void> {
      checkCode("category", c.id);
      const rows = checkTextDetails("category", c.details);
      const d = await db();
      await d.batch([
        d.insert(cat).values({ id: c.id }),
        ...rows.map(([locale, t]) =>
          d.insert(cd).values({
            categoryId: c.id,
            locale,
            name: t.name,
            description: t.description ?? null,
            image: t.image ?? null,
          }),
        ),
      ]);
    },

    async addProduct(p: {
      id: string;
      categoryId: string;
      details: Record<string, TextDetail>;
    }): Promise<void> {
      checkCode("product", p.id);
      const rows = checkTextDetails("product", p.details);
      const d = await db();
      if ((await d.select().from(cat).where(eq(cat.id, p.categoryId)).limit(1)).length === 0)
        reject(`Unknown category ${p.categoryId}`);
      await d.batch([
        d.insert(prod).values({ id: p.id, categoryId: p.categoryId }),
        ...rows.map(([locale, t]) =>
          d.insert(pd).values({
            productId: p.id,
            locale,
            name: t.name,
            description: t.description ?? null,
            image: t.image ?? null,
          }),
        ),
      ]);
    },

    async addItem(i: {
      id: string;
      productId: string;
      details: Record<string, ItemDetailInput>;
    }): Promise<void> {
      checkCode("item", i.id);
      const rows = checkItemDetails(i.details);
      const d = await db();
      if ((await d.select().from(prod).where(eq(prod.id, i.productId)).limit(1)).length === 0)
        reject(`Unknown product ${i.productId}`);
      await d.batch([
        d.insert(item).values({ id: i.id, productId: i.productId }),
        ...rows.map(([locale, t]) =>
          d.insert(idt).values({
            itemId: i.id,
            locale,
            image: t.image as string,
            description: t.description as string,
            listPrice: t.listPrice as number,
            unitCost: t.unitCost as number,
            attr1: t.attr1 ?? null,
            attr2: t.attr2 ?? null,
            attr3: t.attr3 ?? null,
            attr4: t.attr4 ?? null,
            attr5: t.attr5 ?? null,
          }),
        ),
      ]);
    },

    /** The record of one locale, or null. */
    details(kind: "category" | "product" | "item", code: string, locale: string) {
      return read(`details ${kind} ${code} ${locale}`, async (d) => {
        const rows =
          kind === "category"
            ? await d
                .select()
                .from(cd)
                .where(and(eq(cd.categoryId, code), eq(cd.locale, locale)))
            : kind === "product"
              ? await d
                  .select()
                  .from(pd)
                  .where(and(eq(pd.productId, code), eq(pd.locale, locale)))
              : await d
                  .select()
                  .from(idt)
                  .where(and(eq(idt.itemId, code), eq(idt.locale, locale)));
        return rows[0] ?? null;
      });
    },

    ownership(itemId: string) {
      return read(`ownership ${itemId}`, async (d) => {
        const rows = await d
          .select({ productId: item.productId, categoryId: prod.categoryId })
          .from(item)
          .innerJoin(prod, eq(prod.id, item.productId))
          .where(eq(item.id, itemId))
          .limit(1);
        return rows[0] ?? null;
      });
    },

    listCategories(page: PageOptions): Promise<Page<CategoryRow>> {
      const w = windowOf(page, pageSize);
      if (!w.valid) return Promise.resolve(emptyPage());
      return read(`listCategories ${page.locale}`, async (d) =>
        toPage(
          await d
            .select({ id: cat.id, name: cd.name, description: cd.description, image: cd.image })
            .from(cat)
            .innerJoin(cd, and(eq(cd.categoryId, cat.id), eq(cd.locale, page.locale)))
            .orderBy(asc(cd.name), asc(cat.id))
            .limit(w.size + 1)
            .offset(w.start),
          w.size,
          w.start,
        ),
      );
    },

    listProducts(categoryId: string, page: PageOptions): Promise<Page<ProductRow>> {
      const w = windowOf(page, pageSize);
      if (!w.valid) return Promise.resolve(emptyPage());
      return read(`listProducts ${categoryId} ${page.locale}`, async (d) =>
        toPage(
          await d
            .select({
              id: prod.id,
              categoryId: prod.categoryId,
              name: pd.name,
              description: pd.description,
              image: pd.image,
            })
            .from(prod)
            .innerJoin(pd, and(eq(pd.productId, prod.id), eq(pd.locale, page.locale)))
            .where(eq(prod.categoryId, categoryId))
            .orderBy(asc(pd.name), asc(prod.id))
            .limit(w.size + 1)
            .offset(w.start),
          w.size,
          w.start,
        ),
      );
    },

    listItems(productId: string, page: PageOptions): Promise<Page<ItemRow>> {
      const w = windowOf(page, pageSize);
      if (!w.valid) return Promise.resolve(emptyPage());
      return read(`listItems ${productId} ${page.locale}`, async (d) =>
        toPage(
          await itemsQuery(d, page.locale, eq(item.productId, productId))
            .limit(w.size + 1)
            .offset(w.start),
          w.size,
          w.start,
        ),
      );
    },

    /** Items whose product name, category id or description contains any keyword (R-0052). */
    searchItems(query: string, page: PageOptions): Promise<Page<ItemRow>> {
      const w = windowOf(page, pageSize);
      const keywords = [
        ...new Set(
          parseKeywords((query ?? "").slice(0, MAX_QUERY_LENGTH), page.locale)
            .map((k) => k.toLowerCase())
            .filter(Boolean),
        ),
      ];
      keywords.length = Math.min(keywords.length, MAX_KEYWORDS);
      if (!w.valid || keywords.length === 0) return Promise.resolve(emptyPage());
      const matches = or(
        ...keywords.flatMap((k) => {
          const pattern = `%${escapeLike(k)}%`;
          return [
            sql`lower(${pd.name}) like ${pattern} escape '\\'`,
            sql`lower(${prod.categoryId}) like ${pattern} escape '\\'`,
            sql`lower(${idt.description}) like ${pattern} escape '\\'`,
          ];
        }),
      );
      return read(`searchItems ${page.locale}`, async (d) =>
        toPage(
          await itemsQuery(d, page.locale, matches)
            .limit(w.size + 1)
            .offset(w.start),
          w.size,
          w.start,
        ),
      );
    },

    /** One category, or null when it has no text in the locale. */
    getCategory(categoryId: string, locale: string): Promise<CategoryRow | null> {
      return read(`getCategory ${categoryId} ${locale}`, async (d) => {
        const rows = await d
          .select({ id: cat.id, name: cd.name, description: cd.description, image: cd.image })
          .from(cat)
          .innerJoin(cd, and(eq(cd.categoryId, cat.id), eq(cd.locale, locale)))
          .where(eq(cat.id, categoryId))
          .limit(1);
        return rows[0] ?? null;
      });
    },

    /** One product, or null when it has no text in the locale. */
    getProduct(productId: string, locale: string): Promise<ProductRow | null> {
      return read(`getProduct ${productId} ${locale}`, async (d) => {
        const rows = await d
          .select({
            id: prod.id,
            categoryId: prod.categoryId,
            name: pd.name,
            description: pd.description,
            image: pd.image,
          })
          .from(prod)
          .innerJoin(pd, and(eq(pd.productId, prod.id), eq(pd.locale, locale)))
          .where(eq(prod.id, productId))
          .limit(1);
        return rows[0] ?? null;
      });
    },

    /** One item, or null when it does not exist in the locale. */
    getItem(itemId: string, locale: string): Promise<ItemRow | null> {
      return read(`getItem ${itemId} ${locale}`, async (d) => {
        const rows = await itemsQuery(d, locale, eq(item.id, itemId)).limit(1);
        return rows[0] ?? null;
      });
    },
  };
}

export type Catalog = ReturnType<typeof createCatalog>;

/** A result code is the screen it maps to, else itself; with no code there is no screen. */
export function resolveScreen(resultCode: string, screens: Record<string, string>): string {
  if (!resultCode) throw new Error("Screen not found: no result code");
  return screens[resultCode] ?? resultCode;
}

export type Mapping = {
  action: () => string | Promise<string>;
  screens: Record<string, string>;
};

/** Resolves the last path segment of a `.do` request to a mapping, runs its action, picks the screen. */
export function createFrontController({ mappings }: { mappings: Record<string, Mapping> }) {
  return {
    async handle(requestPath: string) {
      const last = requestPath.split("?")[0].split("/").filter(Boolean).pop() ?? "";
      if (!last.endsWith(".do")) throw new Error(`Not a .do request: ${requestPath}`);
      const name = last.slice(0, -3);
      const mapping = Object.hasOwn(mappings, name) ? mappings[name] : undefined;
      if (!mapping) throw new Error(`No mapping for ${name}`);
      const result = await mapping.action();
      return { mapping: name, screen: resolveScreen(result, mapping.screens), result };
    },
  };
}

/** Rendered fragments kept for a time to live; a fragment older than that is rendered again. */
export function createFragmentCache({ clock }: { clock: () => number }) {
  const entries = new Map<string, { html: string; expires: number }>();
  return {
    async render(
      key: string,
      ttlSeconds: number,
      renderFn: () => Promise<string>,
    ): Promise<string> {
      const hit = entries.get(key);
      if (hit && clock() < hit.expires) return hit.html;
      const html = await renderFn();
      entries.set(key, { html, expires: clock() + ttlSeconds * 1000 });
      return html;
    },
  };
}

/** Exit code 0 when the catalog tables exist (after at most one population request), 8 otherwise. */
export async function runCatalogCheck(ops: {
  tablesExist: () => Promise<boolean>;
  requestPopulation: () => Promise<void>;
}): Promise<{ exitCode: number }> {
  if (await ops.tablesExist()) return { exitCode: 0 };
  try {
    await ops.requestPopulation();
  } catch (cause) {
    console.error("Catalog population failed", cause);
    return { exitCode: 8 };
  }
  return { exitCode: (await ops.tablesExist()) ? 0 : 8 };
}
