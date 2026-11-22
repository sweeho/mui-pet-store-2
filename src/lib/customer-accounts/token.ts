import { decode, encode } from "next-auth/jwt";

import { evaluateSession, SIGNED_ON_MAX_AGE_MS } from "./session-rules";

/** Auth.js names its session cookie one way on http and another on https. */
export const SESSION_COOKIE_NAMES = [
  "__Secure-authjs.session-token",
  "authjs.session-token",
] as const;

/** The secret that signs and encrypts the token, from the environment (OPS-001, SEC-106). */
export function authSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is not set");
  return secret;
}

export type SignOnToken = {
  userName: string;
  sessionVersion: number;
  /** When the user signed on, and when the token was last used (ms). */
  signedAt: number;
  lastActive: number;
};

/** The name and value of the session cookie in a request's `Cookie` header, if any. */
export function findSessionCookie(cookieHeader: string | null | undefined) {
  const jar = new Map<string, string>();
  for (const part of (cookieHeader ?? "").split(";")) {
    const i = part.indexOf("=");
    if (i > 0) jar.set(part.slice(0, i).trim(), part.slice(i + 1).trim());
  }
  for (const name of SESSION_COOKIE_NAMES) {
    const value = jar.get(name);
    if (value) return { name, value };
  }
  return undefined;
}

/** Decode a token cookie. A forged, damaged or unreadable one is null. */
export async function readToken(name: string, value: string): Promise<SignOnToken | null> {
  try {
    const t = await decode({ token: value, secret: authSecret(), salt: name });
    if (
      !t ||
      typeof t.userName !== "string" ||
      typeof t.sessionVersion !== "number" ||
      typeof t.signedAt !== "number" ||
      typeof t.lastActive !== "number"
    ) {
      return null;
    }
    return {
      userName: t.userName,
      sessionVersion: t.sessionVersion,
      signedAt: t.signedAt,
      lastActive: t.lastActive,
    };
  } catch {
    return null;
  }
}

/** The same token with the idle deadline moved to `now`, as cookie text. */
export function renewToken(name: string, token: SignOnToken, now: number): Promise<string> {
  return encode({
    token: { ...token, lastActive: now },
    secret: authSecret(),
    salt: name,
    maxAge: SIGNED_ON_MAX_AGE_MS / 1000,
  });
}

/** A token that has not idled out or outlived its maximum age. Does not look at the database. */
export const isLive = (token: SignOnToken, now: number): boolean =>
  !evaluateSession({ signedOn: true, signedAt: token.signedAt, lastActive: token.lastActive, now })
    .expired;
