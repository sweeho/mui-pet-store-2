import { NextResponse, type NextRequest } from "next/server";

import { decideAccess, PUBLIC_PREFIXES } from "@/lib/customer-accounts/access";
import { findSessionCookie, isLive, readToken, renewToken } from "@/lib/customer-accounts/token";
import { problem } from "@/lib/problem";

/**
 * Server entry points open to anyone (ACC-001); every other path needs a signed-on customer
 * (deny by default, see decideAccess). The template's demo routes stay open for its smoke test.
 */
const DEMO_PATHS = ["/api/hello", "/api/users"];
export const PUBLIC_PATHS = [...PUBLIC_PREFIXES, ...DEMO_PATHS];

/** A token used within this long is not renewed, to spare a cookie write on every request. */
const RENEW_AFTER_MS = 60_000;

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

/**
 * Per request: a request id, the `sid` session cookie on the first visit, the `?locale=` parameter
 * forwarded to server components (the root layout gets no searchParams), an Origin check on
 * data-changing requests, and the sign-on gate: the token is checked for signature, idle time and
 * age (the version on the sign-on record is checked where the customer is read), an idle token is
 * renewed, and a signed-out request for a protected path gets the sign-in screen (a page) or 401.
 */
export async function proxy(request: NextRequest): Promise<NextResponse> {
  const requestId = crypto.randomUUID();
  const forwarded = new Headers(request.headers);
  forwarded.set("x-request-id", requestId);

  const origin = request.headers.get("origin");
  if (!SAFE_METHODS.has(request.method) && origin) {
    const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
    let sameOrigin = false;
    try {
      sameOrigin = new URL(origin).host === host;
    } catch {
      sameOrigin = false;
    }
    if (!sameOrigin) {
      const refused = problem(
        new Request(request.url, { headers: forwarded }),
        403,
        "Forbidden",
        "Cross-origin request refused",
      );
      return new NextResponse(refused.body, { status: 403, headers: refused.headers });
    }
  }

  const existing = request.cookies.get("sid")?.value;
  const sid = existing ?? crypto.randomUUID();
  forwarded.set("x-session-id", sid);
  forwarded.set("x-locale-param", request.nextUrl.searchParams.get("locale") ?? "");

  const now = Date.now();
  const cookie = findSessionCookie(request.headers.get("cookie"));
  const token = cookie ? await readToken(cookie.name, cookie.value) : null;
  const live = token !== null && isLive(token, now);
  const { pathname } = request.nextUrl;
  const open = DEMO_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const access = open
    ? "allow"
    : decideAccess({ pathname, method: request.method, signedOn: live });
  forwarded.set("x-requested-path", `${pathname}${request.nextUrl.search}`);

  let response: NextResponse;
  if (access === "sign-in-required") {
    if (pathname.startsWith("/api/")) {
      const refused = problem(
        new Request(request.url, { headers: forwarded }),
        401,
        "Sign-on required",
        "Sign on to use this resource",
      );
      response = new NextResponse(refused.body, { status: 401, headers: refused.headers });
    } else {
      const target = request.nextUrl.clone();
      target.pathname = "/signin";
      target.search = "?required=1";
      response = NextResponse.rewrite(target, { request: { headers: forwarded } });
    }
  } else {
    response = NextResponse.next({ request: { headers: forwarded } });
  }
  if (cookie && token && !live) {
    response.cookies.delete(cookie.name);
  } else if (cookie && token && now - token.lastActive > RENEW_AFTER_MS) {
    response.cookies.set(cookie.name, await renewToken(cookie.name, token, now), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: cookie.name.startsWith("__Secure-"),
    });
  }
  response.headers.set("X-Request-Id", requestId);
  if (!existing) {
    response.cookies.set("sid", sid, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: request.nextUrl.protocol === "https:",
    });
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
