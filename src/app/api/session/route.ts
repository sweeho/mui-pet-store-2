import { getDb } from "@/db/client";
import { customerFromCookies } from "@/lib/customer-accounts/server";
import { DEFAULT_LOCALE } from "@/lib/localization/locale";
import { createSessionStore } from "@/lib/localization/session-store";
import { problem } from "@/lib/problem";

/**
 * GET /api/session: the session's id, locale and attribute names, and whether a customer is signed
 * on (checked against the token, not the stored flag). Public (shoppers are anonymous).
 */
export async function GET(request: Request): Promise<Response> {
  const sid = request.headers.get("x-session-id");
  if (!sid) return problem(request, 400, "No session", "The request carries no session id");
  const store = createSessionStore(await getDb());
  const session = await store.ensure(sid);
  const me = await customerFromCookies(request.headers.get("cookie"));
  let changed = false;
  if (typeof session.attributes.locale !== "string") {
    session.attributes.locale = DEFAULT_LOCALE;
    changed = true;
  }
  // A token that ended (idle, age, sign-off elsewhere) leaves no signed-on mark in the session.
  if (!me && ("signedOn" in session.attributes || "userName" in session.attributes)) {
    delete session.attributes.signedOn;
    delete session.attributes.userName;
    changed = true;
  }
  if (changed) await store.save(session);
  return Response.json({
    id: session.id,
    signedOn: Boolean(me),
    userName: me?.userName ?? null,
    locale: session.attributes.locale,
    // The cart arrives with the shopping cart capability.
    cartCount: 0,
    attributes: Object.keys(session.attributes),
  });
}
