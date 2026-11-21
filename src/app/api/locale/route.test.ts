/**
 * @jest-environment node
 */
import { getDb } from "@/db/client";
import { auditLog } from "@/db/schema";
import { createSessionStore } from "@/lib/localization/session-store";

import { POST } from "./route";

const form = (body: string, sid = "form-sid") =>
  POST(
    new Request("http://localhost/api/locale", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded", "x-session-id": sid },
      body,
    }),
  );

describe("POST /api/locale", () => {
  it("changes the locale, audits it and redirects to the confirmation", async () => {
    const response = await form("locale=ja_JP&from=%2Fadmin%2Forders");
    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("/locale/changed?from=%2Fadmin%2Forders");
    const session = await createSessionStore(await getDb()).load("form-sid");
    expect(session?.attributes.locale).toBe("ja_JP");
    const rows = await (await getDb()).select().from(auditLog);
    expect(rows.some((r) => r.sessionId === "form-sid" && r.detail === "en_US -> ja_JP")).toBe(
      true,
    );
  });

  it("sends an invalid code back to the form and keeps the locale", async () => {
    const response = await form("locale=xx", "form-sid-2");
    expect(response.headers.get("location")).toBe("/locale?error=invalid&from=%2F");
    const session = await createSessionStore(await getDb()).load("form-sid-2");
    expect(session?.attributes.locale).toBeUndefined();
  });

  it("refuses an off-site return path", async () => {
    const response = await form("locale=en_US&from=%2F%2Fevil.example", "form-sid-3");
    expect(response.headers.get("location")).toBe("/locale/changed?from=%2F");
  });

  it("answers a JSON client's invalid code as problem+json with the request id", async () => {
    const response = await POST(
      new Request("http://localhost/api/locale", {
        method: "POST",
        headers: { "content-type": "application/json", "x-session-id": "j", "x-request-id": "r1" },
        body: JSON.stringify({ locale: "en" }),
      }),
    );
    expect(response.status).toBe(400);
    expect(response.headers.get("content-type")).toBe("application/problem+json");
    expect(await response.json()).toMatchObject({ status: 400, requestId: "r1" });
  });
});
