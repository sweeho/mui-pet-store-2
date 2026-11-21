import { getDb } from "@/db/client";
import { changeLocale } from "@/lib/localization/change-locale";
import { parseForm } from "@/lib/localization/locale";
import { createSessionStore } from "@/lib/localization/session-store";
import { withBasePath } from "@/lib/paths";
import { problem, safeFrom } from "@/lib/problem";

const redirect = (path: string): Response =>
  new Response(null, { status: 303, headers: { Location: withBasePath(path) } });

/**
 * POST /api/locale: change the session locale. A browser form (urlencoded, UTF-8) is answered with
 * a redirect to the confirmation screen; any other client gets JSON or RFC 9457 problem+json.
 */
export async function POST(request: Request): Promise<Response> {
  const isForm = (request.headers.get("content-type") ?? "").includes(
    "application/x-www-form-urlencoded",
  );
  let fields: Record<string, string> = {};
  try {
    fields = isForm
      ? parseForm(Buffer.from(await request.arrayBuffer()))
      : ((await request.json()) as Record<string, string>);
  } catch {
    if (!isForm) return problem(request, 400, "Bad request", "The body is not valid JSON");
  }
  const from = safeFrom(fields.from);
  const sid = request.headers.get("x-session-id");
  if (!sid) return problem(request, 400, "No session", "The request carries no session id");

  const result = await changeLocale(createSessionStore(await getDb()), sid, fields.locale);
  if (isForm) {
    return result.ok
      ? redirect(`/locale/changed?from=${encodeURIComponent(from)}`)
      : redirect(`/locale?error=invalid&from=${encodeURIComponent(from)}`);
  }
  return result.ok
    ? Response.json({ ok: true, locale: fields.locale })
    : problem(request, 400, "Invalid locale", "The locale code is not valid");
}
