import { randomUUID } from "node:crypto";

import { eq } from "drizzle-orm";

import { sessions } from "@/db/schema";
import { changeLocale } from "@/lib/localization/change-locale";
import { DEFAULT_LOCALE } from "@/lib/localization/locale";
import type { SessionStore } from "@/lib/localization/session-store";

import type { Domain } from "./domain";
import type { Deps, ProfileForm } from "./types";

type Parts = Deps & { domain: Domain; store: SessionStore };

export type SignOnResult =
  | {
      ok: true;
      session: { userName: string; signedOn: true; locale: string };
      cart: { locale: string };
    }
  | { ok: false };

/**
 * Sign on: authenticate, then write the user name and the signed-on flag into the shopper session
 * and set the session and cart locale from the profile (R-0073). A sign-on record without a
 * customer record raises nothing and leaves the locale as it was.
 */
export async function signOnToSession(
  { domain, store }: Parts,
  sessionId: string,
  credential: { userName: string; password: string },
): Promise<SignOnResult> {
  if (!(await domain.auth.authenticate(credential.userName, credential.password))) {
    return { ok: false };
  }
  return linkSignedOn({ domain, store }, sessionId, credential.userName);
}

/** The part of sign-on after the credentials were checked (Auth.js checks them in production). */
export async function linkSignedOn(
  { domain, store }: Pick<Parts, "domain" | "store">,
  sessionId: string,
  userName: string,
): Promise<Extract<SignOnResult, { ok: true }>> {
  const credential = { userName };
  const profile = await domain.profiles.get(credential.userName);
  const session = await store.ensure(sessionId);
  session.attributes.userName = credential.userName;
  session.attributes.signedOn = true;
  if (profile) {
    session.attributes.locale = profile.language;
    session.controllerState.locale = profile.language;
  }
  await store.save(session);
  await store.audit({ sessionId, action: "signon", detail: credential.userName });
  const locale = String(session.attributes.locale ?? DEFAULT_LOCALE);
  return {
    ok: true,
    session: { userName: credential.userName, signedOn: true, locale },
    cart: { locale },
  };
}

/**
 * Sign off: end every token of the user (session version), discard the old shopper session and
 * start a new one that keeps only the locale (R-0072). Returns the new session id.
 */
export async function signOffSession(
  { db, domain, store }: Parts,
  sessionId: string,
  userName: string | undefined,
): Promise<string> {
  const old = await store.load(sessionId);
  const locale = String(old?.attributes.locale ?? DEFAULT_LOCALE);
  if (userName) {
    await domain.auth.endSessions(userName);
    await store.audit({ sessionId, action: "signoff", detail: userName });
  }
  await db.delete(sessions).where(eq(sessions.id, sessionId));
  const id = randomUUID();
  const fresh = await store.ensure(id);
  fresh.attributes.locale = locale;
  await store.save(fresh);
  return id;
}

/**
 * Save the signed-on customer's profile and set the session locale to the preferred language
 * (R-0194). The caller names the customer, from the checked token or the session.
 */
export async function saveProfileForSession(
  { domain, store }: Parts,
  sessionId: string,
  userName: string,
  form: ProfileForm,
): Promise<void> {
  await domain.profiles.save(userName, form, sessionId);
  await changeLocale(store, sessionId, form.language);
}
