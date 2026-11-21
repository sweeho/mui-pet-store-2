/**
 * Pages and endpoints open to anyone (ACC-001); every other path needs a signed-on customer. A
 * prefix matches the path itself and everything below it.
 */
export const PUBLIC_PREFIXES = [
  "/catalog",
  "/locale",
  "/locale-link",
  "/api/locale",
  "/api/locales",
  "/api/session",
  "/api/auth",
  "/api/health",
  "/signin",
  "/signup",
  "/user-creation-error",
  "/signed-off",
];

const matches = (pathname: string, prefix: string) =>
  pathname === prefix || pathname.startsWith(`${prefix}/`);

/** The sign-up call is public; reading customers is not. */
const isPublic = (pathname: string, method: string) =>
  pathname === "/" ||
  PUBLIC_PREFIXES.some((p) => matches(pathname, p)) ||
  (pathname === "/api/customers" && method === "POST");

/** Deny by default: a signed-out request is allowed only for a public path. */
export function decideAccess(req: {
  pathname: string;
  method: string;
  signedOn: boolean;
}): "allow" | "sign-in-required" {
  return req.signedOn || isPublic(req.pathname, req.method.toUpperCase())
    ? "allow"
    : "sign-in-required";
}
