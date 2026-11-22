/**
 * @jest-environment node
 */
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { createClient } from "@libsql/client";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";

import type { AppDb } from "@/db/client";
import * as schema from "@/db/schema";

import { createSessionStore } from "./session-store";

async function open() {
  const folder = mkdtempSync(path.join(tmpdir(), "session-store-"));
  const client = createClient({ url: `file:${path.join(folder, "s.db")}` });
  const db = drizzle({ client, schema }) as AppDb;
  await migrate(db, { migrationsFolder: path.join(process.cwd(), "drizzle") });
  return { db, client };
}

describe("session store idle limit", () => {
  it("[SWHM3-C-0162] ends an anonymous session idle for 30 minutes and keeps a recent one", async () => {
    const { db, client } = await open();
    const store = createSessionStore(db);
    const first = await store.ensure("s1");
    first.attributes.locale = "ja_JP";
    await store.save(first);

    await db
      .update(schema.sessions)
      .set({ updatedAt: Date.now() - 29 * 60_000 })
      .where(eq(schema.sessions.id, "s1"));
    expect((await store.ensure("s1")).attributes.locale).toBe("ja_JP");

    await db
      .update(schema.sessions)
      .set({ updatedAt: Date.now() - 30 * 60_000 })
      .where(eq(schema.sessions.id, "s1"));
    expect((await store.ensure("s1")).attributes).toEqual({});
    client.close();
  });
});
