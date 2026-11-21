import { getDb } from "@/db/client";
import { DEFAULT_LOCALE } from "@/lib/localization/locale";
import { createSessionStore } from "@/lib/localization/session-store";
import { problem } from "@/lib/problem";

/** GET /api/session: the session's id, locale and attribute names. Public (shoppers are anonymous). */
export async function GET(request: Request): Promise<Response> {
  const sid = request.headers.get("x-session-id");
  if (!sid) return problem(request, 400, "No session", "The request carries no session id");
  const store = createSessionStore(await getDb());
  const session = await store.ensure(sid);
  if (typeof session.attributes.locale !== "string") {
    session.attributes.locale = DEFAULT_LOCALE;
    await store.save(session);
  }
  return Response.json({
    id: session.id,
    locale: session.attributes.locale,
    attributes: Object.keys(session.attributes),
  });
}
