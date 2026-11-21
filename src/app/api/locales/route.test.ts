/**
 * @jest-environment node
 */
import { GET } from "./route";

describe("GET /api/locales", () => {
  it("lists the four supported languages with underscore codes", async () => {
    const list = (await GET().json()) as { code: string }[];
    expect(list.map((l) => l.code)).toEqual(["en_US", "de_DE", "ja_JP", "zh_CN"]);
  });
});
