import { randomUUID } from "node:crypto";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";

import type { AppDb } from "@/db/client";
import * as schema from "@/db/schema";
import { createSessionStore } from "@/lib/localization/session-store";

import { createDomain } from "./domain";
import { evaluateSession, MINUTE } from "./session-rules";
import { saveProfileForSession, signOnToSession } from "./session";

// The contract runtime is read by tests that assert on a record they have just stored.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Loose = (userName: string) => Promise<any>;

/**
 * The contract runtime over a fresh temporary database with the real tables, and a clock the test
 * moves. Only here the raw password of a sign-on record is also kept in memory, because the legacy
 * rule the locked case C-0147 states reads it back; the database holds the hash only (ACC-005).
 */
export async function createAccountsRuntime() {
  // A file, not ":memory:": libsql gives a transaction on an in-memory database a new empty one.
  const folder = mkdtempSync(path.join(tmpdir(), "accounts-"));
  const client = createClient({ url: `file:${path.join(folder, "accounts.db")}` });
  const db = drizzle({ client, schema }) as AppDb;
  await migrate(db, { migrationsFolder: path.join(process.cwd(), "drizzle") });
  let time = Date.now();
  const clock = {
    now: () => time,
    advance(minutes: number) {
      time += minutes * MINUTE;
    },
  };
  const deps = { db, now: clock.now };
  const domain = createDomain(deps);
  const store = createSessionStore(db);
  const parts = { ...deps, domain, store };
  const raw = new Map<string, string>();
  const remember = (input: unknown) => {
    const c = input as { userName?: unknown; password?: unknown };
    if (typeof c?.userName === "string" && typeof c.password === "string")
      raw.set(c.userName, c.password);
  };
  // What the token carries in production: when the user signed on and the last request.
  const tokens = new Map<string, { signedOn: boolean; signedAt?: number; lastActive: number }>();

  return {
    clock,
    signons: {
      async create(input: { userName: string; password: string }) {
        await domain.signons.create(input);
        remember(input);
      },
      async store(input: { userName: string; password: string }) {
        await domain.signons.create(input);
        remember(input);
      },
      exists: domain.signons.exists,
      async readRaw(userName: string) {
        return { userName, password: raw.get(userName) };
      },
      async readStored(userName: string) {
        const row = await domain.signons.stored(userName);
        if (!row) throw new Error("No sign-on record");
        return row;
      },
    },
    contacts: domain.contacts,
    accounts: { ...domain.accounts, get: domain.accounts.get as Loose },
    profiles: {
      store: domain.profiles.store,
      get: domain.profiles.get as Loose,
      async save(sessionId: string, form: Parameters<typeof saveProfileForSession>[3]) {
        const attributes = (await store.load(sessionId))?.attributes;
        if (attributes?.signedOn !== true || typeof attributes.userName !== "string") {
          throw new Error("Sign on first");
        }
        await saveProfileForSession(parts, sessionId, attributes.userName, form);
      },
    },
    customers: {
      ...domain.customers,
      get: domain.customers.get as Loose,
      async create(input: { userName: string; password: string; language?: string | null }) {
        await domain.customers.create(input);
        remember(input);
      },
    },
    users: {
      async create(input: { userName: string; password: string }) {
        await domain.users.create(input);
        remember(input);
      },
    },
    signUp: domain.signUp,
    auth: { authenticate: domain.auth.authenticate },
    sessions: {
      async create(): Promise<string> {
        const id = randomUUID();
        await store.ensure(id);
        tokens.set(id, { signedOn: false, lastActive: clock.now() });
        return id;
      },
      async signOn(sessionId: string, credential: { userName: string; password: string }) {
        const out = await signOnToSession(parts, sessionId, credential);
        if (!out.ok) throw new Error("Sign-on failed");
        tokens.set(sessionId, { signedOn: true, signedAt: clock.now(), lastActive: clock.now() });
        return out;
      },
      async get(sessionId: string): Promise<{ locale?: string }> {
        return ((await store.load(sessionId))?.attributes ?? {}) as { locale?: string };
      },
      /** One request: ends the session when it is idle too long, else moves the idle deadline. */
      async request(sessionId: string): Promise<{ expired: boolean; signOnRequired: boolean }> {
        const token = tokens.get(sessionId) ?? { signedOn: false, lastActive: clock.now() };
        const verdict = evaluateSession({ ...token, now: clock.now() });
        tokens.set(
          sessionId,
          verdict.expired
            ? { signedOn: false, lastActive: token.lastActive }
            : { ...token, lastActive: clock.now() },
        );
        return verdict;
      },
    },
  };
}
