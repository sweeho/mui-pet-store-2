import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { databaseUrl, prepareDatabase } from "./prepare";

/**
 * Jest global setup for the SQLite option: a fresh database file for the run, migrated and seeded
 * once, so tests never touch or share sqlite.db. The test workers inherit the environment it sets.
 */
export default async function setup(): Promise<void> {
  const dir = mkdtempSync(join(tmpdir(), "app-test-"));
  // Read by the global teardown (test-teardown.ts), which shares this global.
  (globalThis as unknown as { appTestDir?: string }).appTestDir = dir;
  process.env.DATABASE_PATH = join(dir, "test.db");
  await prepareDatabase(databaseUrl());
  process.env.APP_DATABASE_READY = "1";
}
