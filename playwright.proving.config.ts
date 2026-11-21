import { defineConfig } from "@playwright/test";

// Proving tests (tests/proving/*.proving.spec.ts) measure the BUILT server named by
// PROVING_BASE_URL and report each value to Vortex as JUnit properties. They start no server:
// CI's non-gating `proving` job builds and starts the standalone server first. Run through the
// `test-perf` command slot.
export default defineConfig({
  testDir: "./tests/proving",
  testMatch: "**/*.proving.spec.ts",
  forbidOnly: true,
  retries: 0,
  workers: 1,
  reporter: "list",
  use: { baseURL: process.env.PROVING_BASE_URL ?? "http://127.0.0.1:3000" },
});
