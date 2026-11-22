/**
 * @jest-environment node
 */
import { NextRequest } from "next/server";

import { PUBLIC_PATHS, proxy } from "./proxy";

// next-auth/jwt is an ES module Jest does not load; a plain encoding stands in for the encrypted token.
jest.mock("next-auth/jwt", () => ({
  encode: async ({ token }: { token: unknown }) =>
    Buffer.from(JSON.stringify(token)).toString("base64url"),
  decode: async ({ token }: { token: string }) =>
    JSON.parse(Buffer.from(token, "base64url").toString()),
}));

const COOKIE = "authjs.session-token";
const tokenCookie = (over: Record<string, unknown> = {}) =>
  `${COOKIE}=${Buffer.from(
    JSON.stringify({
      userName: "ann",
      sessionVersion: 0,
      signedAt: Date.now(),
      lastActive: Date.now(),
      ...over,
    }),
  ).toString("base64url")}`;

describe("proxy", () => {
  it("issues an httpOnly sid cookie on the first visit and a request id", async () => {
    const res = await proxy(new NextRequest("http://localhost/locale"));
    expect(res.cookies.get("sid")?.value).toBeTruthy();
    expect(res.headers.get("set-cookie")).toMatch(/HttpOnly/i);
    expect(res.headers.get("x-request-id")).toBeTruthy();
  });

  it("keeps an existing session", async () => {
    const res = await proxy(
      new NextRequest("http://localhost/", { headers: { cookie: "sid=abc" } }),
    );
    expect(res.cookies.get("sid")).toBeUndefined();
  });

  it("refuses a data-changing request from a foreign Origin", async () => {
    const res = await proxy(
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

  it("[SWHM3-C-0151] rewrites a signed-out page request to the sign-in screen and remembers the path", async () => {
    const res = await proxy(new NextRequest("http://localhost/customer"));
    expect(res.headers.get("x-middleware-rewrite")).toContain("/signin?required=1");
    expect(res.headers.get("x-middleware-request-x-requested-path")).toBe("/customer");
  });

  it("[SWHM3-C-0152] answers 401 problem+json to a signed-out API request", async () => {
    const res = await proxy(new NextRequest("http://localhost/api/orders", { method: "POST" }));
    expect(res.status).toBe(401);
    expect(res.headers.get("content-type")).toContain("application/problem+json");
  });

  it("lets a live token through and leaves a fresh one alone", async () => {
    const res = await proxy(
      new NextRequest("http://localhost/account/profile", { headers: { cookie: tokenCookie() } }),
    );
    expect(res.headers.get("x-middleware-rewrite")).toBeNull();
    expect(res.cookies.get(COOKIE)).toBeUndefined();
  });

  it("[SWHM3-C-0142] refuses a token idle for 15 minutes and clears its cookie", async () => {
    const res = await proxy(
      new NextRequest("http://localhost/account/profile", {
        headers: { cookie: tokenCookie({ lastActive: Date.now() - 15 * 60_000 }) },
      }),
    );
    expect(res.headers.get("x-middleware-rewrite")).toContain("/signin");
    expect(res.headers.get("set-cookie")).toContain(`${COOKIE}=;`);
  });

  it("refuses a token older than 8 hours however recently it was used", async () => {
    const res = await proxy(
      new NextRequest("http://localhost/customer", {
        headers: { cookie: tokenCookie({ signedAt: Date.now() - 8 * 3_600_000 }) },
      }),
    );
    expect(res.headers.get("x-middleware-rewrite")).toContain("/signin");
  });

  it("moves the idle deadline of a token used more than a minute ago", async () => {
    const res = await proxy(
      new NextRequest("http://localhost/customer", {
        headers: { cookie: tokenCookie({ lastActive: Date.now() - 5 * 60_000 }) },
      }),
    );
    expect(res.cookies.get(COOKIE)?.value).toBeTruthy();
    expect(res.headers.get("x-middleware-rewrite")).toBeNull();
  });

  it("treats a forged token as signed out", async () => {
    const res = await proxy(
      new NextRequest("http://localhost/customer", { headers: { cookie: `${COOKIE}=garbage` } }),
    );
    expect(res.headers.get("x-middleware-rewrite")).toContain("/signin");
  });
});
