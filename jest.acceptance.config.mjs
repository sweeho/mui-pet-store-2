import nextJest from "next/jest.js";

// The locked acceptance suite's unit-level specs (tests/acceptance/**/*.test.ts[x]), apart from the
// default run. Browser specs under tests/acceptance/<capability>/e2e/ run in Playwright
// (playwright.acceptance.config.ts).
const createJestConfig = nextJest({ dir: "./" });

/** @type {import("jest").Config} */
const config = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: { "^@/(.*)$": "<rootDir>/src/$1" },
  // The build's standalone output has a copy of package.json.
  modulePathIgnorePatterns: ["<rootDir>/.next/"],
  roots: ["<rootDir>/tests/acceptance"],
  testMatch: ["**/*.test.ts", "**/*.test.tsx"],
  testPathIgnorePatterns: ["/e2e/"],
  globalSetup: "<rootDir>/src/db/test-setup.ts",
  globalTeardown: "<rootDir>/src/db/test-teardown.ts",
  passWithNoTests: true,
};

export default createJestConfig(config);
