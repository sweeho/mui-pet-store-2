import path from "node:path";

import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";

import { users } from "./schema";

/** The SQLite file's URL: DATABASE_PATH (the Docker image sets one), else sqlite.db at the root. */
export function databaseUrl(): string {
  // Resolved from the working directory: Next.js bundles this module, so its own location is not
  // a real file path.
  return `file:${path.resolve(/* turbopackIgnore: true */ process.cwd(), process.env.DATABASE_PATH ?? "sqlite.db")}`;
}

/** Apply the migrations in `drizzle/` and seed the two demo users when the table is empty. */
export async function prepareDatabase(url: string): Promise<void> {
  const client = createClient({ url });
  try {
    const db = drizzle({ client, schema: { users } });
    await migrate(db, {
      migrationsFolder: path.join(/* turbopackIgnore: true */ process.cwd(), "drizzle"),
    });
    if ((await db.select().from(users).limit(1)).length === 0) {
      await db.insert(users).values([
        { name: "John Doe", email: "john@example.com" },
        { name: "Jane Smith", email: "jane@example.com" },
      ]);
    }
  } finally {
    client.close();
  }
}
