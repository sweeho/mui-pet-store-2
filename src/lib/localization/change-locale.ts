import { DEFAULT_LOCALE, parseLocaleCode } from "./locale";
import type { SessionStore } from "./session-store";

export type ChangeLocaleResult = { ok: boolean; screen?: string; error?: Error };

/**
 * Set the session locale and the controller state's `locale`, and record who changed what and
 * when. An unparseable code fails and leaves the session as it was. The runtime and the web
 * routes both call this.
 */
export async function changeLocale(
  store: SessionStore,
  sessionId: string,
  code: string | null | undefined,
): Promise<ChangeLocaleResult> {
  const locale = parseLocaleCode(code);
  if (!locale) return { ok: false, error: new Error(`Invalid locale code: ${String(code)}`) };
  const session = await store.ensure(sessionId);
  const previous = String(session.attributes.locale ?? DEFAULT_LOCALE);
  session.attributes.locale = locale.code;
  session.controllerState.locale = locale.code;
  await store.save(session);
  await store.audit({
    sessionId,
    action: "locale.change",
    detail: `${previous} -> ${locale.code}`,
  });
  return { ok: true, screen: "locale-changed" };
}
