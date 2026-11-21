/**
 * @jest-environment node
 */
import { NextRequest } from "next/server";

import { PUBLIC_PATHS, proxy } from "./proxy";

describe("proxy", () => {
  it("issues an httpOnly sid cookie on the first visit and a request id", () => {
    const res = proxy(new NextRequest("http://localhost/locale"));
    expect(res.cookies.get("sid")?.value).toBeTruthy();
    expect(res.headers.get("set-cookie")).toMatch(/HttpOnly/i);
    expect(res.headers.get("x-request-id")).toBeTruthy();
  });

  it("keeps an existing session", () => {
    const res = proxy(new NextRequest("http://localhost/", { headers: { cookie: "sid=abc" } }));
    expect(res.cookies.get("sid")).toBeUndefined();
  });

  it("refuses a data-changing request from a foreign Origin", () => {
    const res = proxy(
      new NextRequest("http://localhost/api/locale", {
        method: "POST",
        headers: { origin: "http://evil.example", host: "localhost" },
      }),
    );
    expect(res.status).toBe(403);
  });

  it("lists the catalog browsing entry point as public", () => {
    expect(PUBLIC_PATHS).toContain("/catalog");
  });

  it("lists the localization entry points as public", () => {
    expect(PUBLIC_PATHS).toEqual(
      expect.arrayContaining(["/locale", "/api/locale", "/locale-link"]),
    );
  });
});
