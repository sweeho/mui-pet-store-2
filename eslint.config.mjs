import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "coverage/**",
    "reports/**",
    ".stryker-tmp/**",
    "playwright-report/**",
    "test-results/**",
    // The acceptance suite: the Test Author writes it and a person locks it. No sprint agent may
    // edit it, so a warning in it would fail every sprint with nobody able to fix it.
    "tests/acceptance/**",
  ]),
]);
