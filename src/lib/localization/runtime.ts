import { eq } from "drizzle-orm";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import path from "node:path";
import { randomUUID } from "node:crypto";

import type { AppDb } from "@/db/client";
import * as schema from "@/db/schema";

import { changeLocale } from "./change-locale";
import { DEFAULT_LOCALE, parseForm, parseLocaleCode } from "./locale";
import { createSessionStore, type SessionData } from "./session-store";

export type RuntimeOptions = {
  screens?: Record<string, Record<string, string>>;
  exceptionMappings?: Record<string, string>;
};

type Detail = { locale: string; name?: string; image?: string; description?: string };

const reject = (message: string): never => {
  throw new Error(message);
};

/**
 * The localization runtime over a fresh store (an in-memory database with the real tables and
 * constraints): sessions, controller state, per-locale screens, exception mappings and
 * per-locale catalog text. Session reads are synchronous, so it keeps a write-through view.
 */
export async function createLocalizationRuntime(opts: RuntimeOptions = {}) {
  const client = createClient({ url: ":memory:" });
  const db = drizzle({ client, schema }) as AppDb;
  await migrate(db, { migrationsFolder: path.join(process.cwd(), "drizzle") });
  const store = createSessionStore(db);
  const screens = opts.screens ?? { [DEFAULT_LOCALE]: {} };
  const mappings = opts.exceptionMappings ?? {};
  const view = new Map<string, SessionData>();

  const remember = (s: SessionData) => {
    view.set(s.id, s);
    return s;
  };
  const cached = {
    async load(id: string) {
      const hit = view.get(id);
      return hit ?? (await store.load(id));
    },
    async ensure(id: string) {
      return remember(view.get(id) ?? (await store.ensure(id)));
    },
    async save(s: SessionData) {
      remember(s);
      await store.save(s);
    },
    audit: store.audit,
  };

  const requireDetail = (d: Detail) => {
    if (!d.name) reject("A detail needs a name");
    if (!d.locale || !parseLocaleCode(d.locale)) reject("A detail needs a valid locale");
  };

  return {
    catalog: {
      addCategory: async (c: { id: string }) => {
        await db.insert(schema.category).values({ id: c.id });
      },
      addProduct: async (p: { id: string; categoryId: string }) => {
        await db.insert(schema.product).values({ id: p.id, categoryId: p.categoryId });
      },
      saveCategoryDetail: async (d: { categoryId: string } & Detail) => {
        requireDetail(d);
        await db.insert(schema.categoryDetails).values({
          categoryId: d.categoryId,
          locale: d.locale,
          name: d.name as string,
          image: d.image,
          description: d.description,
        });
      },
      saveProductDetail: async (d: { productId: string } & Detail) => {
        requireDetail(d);
        await db.insert(schema.productDetails).values({
          productId: d.productId,
          locale: d.locale,
          name: d.name as string,
          image: d.image,
          description: d.description,
        });
      },
      categoryDetails: (id: string) =>
        db.select().from(schema.categoryDetails).where(eq(schema.categoryDetails.categoryId, id)),
      productDetails: (id: string) =>
        db.select().from(schema.productDetails).where(eq(schema.productDetails.productId, id)),
    },
    sessions: {
      async create(): Promise<string> {
        const id = randomUUID();
        await cached.ensure(id);
        return id;
      },
      get: (id: string): { locale?: string } => ({
        locale: view.get(id)?.attributes.locale as string | undefined,
      }),
    },
    changeLocale: (sessionId: string, code: string) => changeLocale(cached, sessionId, code),
    controllerState: (sessionId: string): { locale?: string } => ({
      locale: view.get(sessionId)?.controllerState.locale as string | undefined,
    }),
    parseForm,
    async handle(req: {
      sessionId?: string;
      screen: string;
      params?: Record<string, string>;
      raise?: string;
    }) {
      const session = await cached.ensure(req.sessionId ?? randomUUID());
      if (!session.attributes.locale) {
        session.attributes.locale = DEFAULT_LOCALE;
        await cached.save(session);
      }
      const wanted = req.params?.locale ?? (session.attributes.locale as string);
      const localeUsed = wanted in screens ? wanted : DEFAULT_LOCALE;
      let screen = req.screen;
      let status = 200;
      if (req.raise !== undefined) {
        const mapped = mappings[req.raise];
        if (mapped) screen = mapped;
        else status = 500;
      }
      const template = screens[localeUsed]?.[screen] ?? screens[DEFAULT_LOCALE]?.[screen];
      const html =
        status === 500 ? "Server error" : (template ?? `Definition for screen ${screen} not found`);
      return { status, sessionId: session.id, screen, localeUsed, html };
    },
  };
}
