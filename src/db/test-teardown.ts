import { rmSync } from "node:fs";

/** Jest global teardown for the SQLite option: remove the run's database file. */
export default function teardown(): void {
  const dir = (globalThis as unknown as { appTestDir?: string }).appTestDir;
  if (dir) rmSync(dir, { recursive: true, force: true });
}
