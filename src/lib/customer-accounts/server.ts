import { getDb } from "@/db/client";

import { createDomain } from "./domain";
import { findSessionCookie, isLive, readToken } from "./token";

/** The domain over the application's database and clock. */
export async function getDomain() {
  return createDomain({ db: await getDb(), now: Date.now });
}

export type SignedOnCustomer = { userName: string };

/**
 * The customer behind a request's `Cookie` header, or undefined. Checked on the server on every
 * call: the token's signature, the idle and maximum-age limits, and that its session version is
 * still the one on the sign-on record (sign-off, a password change and disabling raise it).
 * Later capabilities read the signed-on customer through this function, never the token.
 */
export async function customerFromCookies(
  cookieHeader: string | null | undefined,
): Promise<SignedOnCustomer | undefined> {
  const cookie = findSessionCookie(cookieHeader);
  if (!cookie) return undefined;
  const token = await readToken(cookie.name, cookie.value);
  if (!token || !isLive(token, Date.now())) return undefined;
  const domain = await getDomain();
  if ((await domain.auth.sessionVersion(token.userName)) !== token.sessionVersion) return undefined;
  const account = await domain.accounts.get(token.userName);
  if (account?.status === "disabled") return undefined;
  return { userName: token.userName };
}
