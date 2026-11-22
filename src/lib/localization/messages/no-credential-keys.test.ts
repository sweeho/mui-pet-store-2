/**
 * @jest-environment node
 */
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

// A secret scanner reads `<key containing secret/password>: "<literal>"` as a
// hardcoded credential. UI label keys must not use those words.
describe("message catalogs", () => {
  const dir = __dirname;
  const files = readdirSync(dir).filter((f) => /^[a-z]{2}_[A-Z]{2}\.ts$/.test(f));

  it.each(files)("%s has no secret/password-named keys", (file) => {
    const src = readFileSync(path.join(dir, file), "utf8");
    const bad = src.split("\n").filter((l) => /^\s*"[^"]*(secret|passw)[^"]*"\s*:/i.test(l));
    expect(bad).toEqual([]);
  });
});
