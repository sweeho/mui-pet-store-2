import nextJest from "next/jest.js";

// Jest through next/jest: Next.js's own compiler, its env files and its module rules. Component
// tests run in jsdom; a route or database test says `@jest-environment node` at its top.
const createJestConfig = nextJest({ dir: "./" });

/** @type {import("jest").Config} */
const config = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: { "^@/(.*)$": "<rootDir>/src/$1" },
  // The build's standalone output has a copy of package.json.
  modulePathIgnorePatterns: ["<rootDir>/.next/"],
  // The locked acceptance suite runs on its own (jest.acceptance.config.mjs), never in `npm test`.
  testPathIgnorePatterns: [
    "<rootDir>/node_modules/",
    "<rootDir>/e2e/",
    "<rootDir>/tests/acceptance/",
    "<rootDir>/tests/proving/",
    "<rootDir>/.stryker-tmp/",
  ],
  // The database option's own setup: a fresh file per run for SQLite, one throwaway cluster for
  // PostgreSQL (src/db/test-setup.ts).
  globalSetup: "<rootDir>/src/db/test-setup.ts",
  globalTeardown: "<rootDir>/src/db/test-teardown.ts",
};

export default createJestConfig(config);
