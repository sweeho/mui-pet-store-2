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

/**
 * Pages that need a signed-on customer. A path that matches no page is left to the 404 page, which
 * shows no data. A capability that adds a page behind sign-on adds its prefix here.
 */
export const PROTECTED_PAGE_PREFIXES = ["/customer", "/account", "/orders", "/checkout", "/admin"];

/**
 * Deny by default for every endpoint (`/api/**`): open only on the public list. Pages are open
 * except the protected prefixes.
 */
export function decideAccess(req: {
  pathname: string;
  method: string;
  signedOn: boolean;
}): "allow" | "sign-in-required" {
  if (req.signedOn) return "allow";
  const { pathname } = req;
  if (pathname === "/api" || pathname.startsWith("/api/")) {
    const open =
      PUBLIC_PREFIXES.some((p) => matches(pathname, p)) ||
      (pathname === "/api/customers" && req.method.toUpperCase() === "POST");
    return open ? "allow" : "sign-in-required";
  }
  return PROTECTED_PAGE_PREFIXES.some((p) => matches(pathname, p)) ? "sign-in-required" : "allow";
}
