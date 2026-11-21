import { cookies, headers } from "next/headers";
import { cache } from "react";

import { getDb } from "@/db/client";

import { DEFAULT_LOCALE, parseLocaleCode, toBcp47 } from "./locale";
import { messageLocale } from "./messages";
import { createSessionStore } from "./session-store";

export const SESSION_COOKIE = "sid";
/** Request headers the proxy (src/proxy.ts) sets for server components and route handlers. */
export const SESSION_HEADER = "x-session-id";
export const LOCALE_PARAM_HEADER = "x-locale-param";

/** The session id of the current request: the proxy's header, else the cookie. */
export async function getSessionId(): Promise<string | undefined> {
  return (await headers()).get(SESSION_HEADER) ?? (await cookies()).get(SESSION_COOKIE)?.value;
}

export type LocaleContext = {
  /** The shopper's choice: ?locale=, else the session, else en_US. Formatting follows it. */
  chosen: string;
  /** The locale whose text is shown: the choice, or en_US when it has no messages. */
  locale: string;
  /** For <html lang>. */
  lang: string;
};

/**
 * The locale of this request, once per request. A session with no locale reads as en_US, which is
 * written on first use.
 */
export const getLocaleContext = cache(async (): Promise<LocaleContext> => {
  const param = parseLocaleCode((await headers()).get(LOCALE_PARAM_HEADER))?.code;
  let chosen = param;
  const sid = await getSessionId();
  if (sid) {
    const store = createSessionStore(await getDb());
    const session = await store.ensure(sid);
    const stored = session.attributes.locale;
    if (typeof stored !== "string") {
      session.attributes.locale = DEFAULT_LOCALE;
      await store.save(session);
    }
    chosen ??= typeof stored === "string" ? stored : DEFAULT_LOCALE;
  }
  chosen ??= DEFAULT_LOCALE;
  const locale = messageLocale(chosen);
  return { chosen, locale, lang: toBcp47(locale).split("-")[0] };
});

/** The locale whose text this request shows (P5). */
export async function getRequestLocale(): Promise<string> {
  return (await getLocaleContext()).locale;
}
