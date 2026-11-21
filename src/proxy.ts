import { NextResponse, type NextRequest } from "next/server";

import { problem } from "@/lib/problem";

/**
 * Server entry points open to anyone (ACC-001). Shoppers are anonymous in this change;
 * deny-by-default arrives with sign-in (SWHM3-I-0004).
 */
export const PUBLIC_PATHS = [
  "/catalog",
  "/locale",
  "/locale/changed",
  "/api/locale",
  "/api/locales",
  "/api/session",
  "/locale-link",
];

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

/**
 * Per request: a request id, the `sid` session cookie on the first visit, the `?locale=` parameter
 * forwarded to server components (the root layout gets no searchParams), and an Origin check on
 * data-changing requests.
 */
export function proxy(request: NextRequest): NextResponse {
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

  const response = NextResponse.next({ request: { headers: forwarded } });
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
