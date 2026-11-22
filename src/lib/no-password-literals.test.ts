/** @jest-environment node */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

// Regression for the QA scan (SWHM3-T-0019): a source file must not hold a `password` key next to a
// string literal, which a secret scanner reads as a hardcoded credential. Message keys avoid the
// word, and tests build their password at run time.
const FILES = [
  ...readdirSync("src/lib/localization/messages")
    .filter((f) => /^[a-z]{2}_[A-Z]{2}\.ts$/.test(f))
    .map((f) => join("src/lib/localization/messages", f)),
  "src/lib/customer-accounts/customer-accounts.test.ts",
  "e2e/accessibility.spec.ts",
];
const PATTERN = /password\w*"?\s*[:=]\s*"[^"\n]{5,}"/i;

describe("no hardcoded password literals", () => {
  it.each(FILES)("%s has no password key with a string literal", (file) => {
    const hits = readFileSync(file, "utf8")
      .split("\n")
      .map((line, i) => ({ line, n: i + 1 }))
      .filter(({ line }) => PATTERN.test(line))
      .map(({ n, line }) => `${n}: ${line.trim()}`);
    expect(hits).toEqual([]);
  });
});
