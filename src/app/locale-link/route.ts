import { getDb } from "@/db/client";
import { changeLocale } from "@/lib/localization/change-locale";
import { createSessionStore } from "@/lib/localization/session-store";
import { withBasePath } from "@/lib/paths";
import { problem } from "@/lib/problem";

/** The route each screen name is shown at. Anything else returns to the landing page. */
const SCREEN_ROUTES: Record<string, string> = {
  main: "/",
  locale: "/locale",
  "locale-changed": "/locale/changed",
};

const ATTRIBUTE = /^(?:[^_]+)_attribute_([A-Za-z0-9_.-]{1,64})$/;
const FORBIDDEN_KEYS = new Set(["__proto__", "constructor", "prototype", "locale"]);
const MAX_ATTRIBUTES = 20;
const MAX_VALUE_LENGTH = 4096;

/**
 * GET /locale-link: a locale-change link. Each `<cacheId>_attribute_<key>` is Base64 of a JSON
 * value and becomes a session attribute (never an object deserialisation). A value that does not
 * decode is logged and skipped. The locale is set, then the referring screen is shown.
 */
export async function GET(request: Request): Promise<Response> {
  const sid = request.headers.get("x-session-id");
  if (!sid) return problem(request, 400, "No session", "The request carries no session id");
  const params = new URL(request.url).searchParams;
  const store = createSessionStore(await getDb());

  const session = await store.ensure(sid);
  let restored = 0;
  for (const [name, value] of params) {
    const key = ATTRIBUTE.exec(name)?.[1];
    if (!key || FORBIDDEN_KEYS.has(key) || restored >= MAX_ATTRIBUTES) continue;
    try {
      if (value.length > MAX_VALUE_LENGTH) throw new Error("value too long");
      session.attributes[key] = JSON.parse(Buffer.from(value, "base64").toString("utf8"));
      restored++;
    } catch (error) {
      console.error(`locale-link: skipped attribute ${key}`, error);
    }
  }
  await store.save(session);

  const result = await changeLocale(store, sid, params.get("locale"));
  if (!result.ok) return problem(request, 400, "Invalid locale", "The locale code is not valid");
  const route = SCREEN_ROUTES[params.get("referring_screen") ?? ""] ?? "/";
  return new Response(null, { status: 303, headers: { Location: withBasePath(route) } });
}
