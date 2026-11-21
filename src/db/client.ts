import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

import { databaseUrl, prepareDatabase } from "./prepare";
import { users } from "./schema";

// One connection per process, kept across hot reloads in development, and how to close it
// (the test setup closes it after each test file).
const closers = globalThis as unknown as {
  appDb?: Promise<Db>;
  appDbClose?: () => Promise<void>;
};

function connect(url: string) {
  const client = createClient({ url });
  closers.appDbClose = async () => {
    delete closers.appDb;
    client.close();
  };
  return drizzle({ client, schema: { users } });
}

type Db = ReturnType<typeof connect>;

// Prepared once per process. The test run's global setup (test-setup.ts) prepares its own file
// before any test and says so through APP_DATABASE_READY, so parallel test workers never migrate
// the same file at once.
async function open(): Promise<Db> {
  const url = databaseUrl();
  if (!process.env.APP_DATABASE_READY) {
    await prepareDatabase(url);
    process.env.APP_DATABASE_READY = "1";
  }
  return connect(url);
}

/** The database, migrated and seeded on first use. */
export function getDb(): Promise<Db> {
  // A failed open is not kept: the next request tries again, so a database that was not up yet
  // does not leave the server broken for good.
  closers.appDb ??= open().catch((err: unknown) => {
    delete closers.appDb;
    throw err;
  });
  return closers.appDb;
}
