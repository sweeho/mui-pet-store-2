import { defineConfig, devices } from "@playwright/test";

// The locked acceptance suite's browser specs (tests/acceptance/<capability>/e2e/*.spec.ts). The
// merge gate reads one run of these per ticket, so: no retries, waits long enough for a sign-in and
// a checkout on a CI runner, and a JUnit report every time.
const PORT = 3101;

export default defineConfig({
  testDir: "./tests/acceptance",
  testMatch: "**/e2e/**/*.spec.ts",
  timeout: 30_000,
  expect: { timeout: 10_000 },
  forbidOnly: true,
  retries: 0,
  reporter: [["list"], ["junit", { outputFile: ".vortex-results/acceptance/e2e-junit.xml" }]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
    launchOptions: { args: ["--disable-dev-shm-usage"] },
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `npx next dev --port ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false,
    timeout: 180_000,
    stdout: "pipe",
  },
});
