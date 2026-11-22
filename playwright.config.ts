import { defineConfig, devices } from "@playwright/test";

// A port of its own, distinct from the dev server's 3000, so a running dev server never absorbs a
// test run.
const PORT = 3100;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: true,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
    // An agent container has a small /dev/shm, where Chromium hangs.
    launchOptions: { args: ["--disable-dev-shm-usage"] },
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `npx next dev --port ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false,
    // The first request compiles the page: a cold runner pays for it here.
    timeout: 180_000,
    stdout: "pipe",
  },
});
