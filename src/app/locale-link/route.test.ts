/**
 * @jest-environment node
 */
import { getDb } from "@/db/client";
import { createSessionStore } from "@/lib/localization/session-store";

import { GET } from "./route";

const call = (query: URLSearchParams, sid: string) =>
  GET(new Request(`http://localhost/locale-link?${query}`, { headers: { "x-session-id": sid } }));

describe("GET /locale-link", () => {
  it("[SWHM3-C-0011] restores attributes, sets the locale and shows the referring screen", async () => {
    const value = Buffer.from(JSON.stringify("kept-note"), "utf8").toString("base64");
    const response = await call(
      new URLSearchParams({
        locale: "ja_JP",
        referring_screen: "main",
        cache1_attribute_note: value,
      }),
      "link-test-1",
    );
    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("/");
    const session = await createSessionStore(await getDb()).load("link-test-1");
    expect(session?.attributes.note).toBe("kept-note");
    expect(session?.attributes.locale).toBe("ja_JP");
  });
});
