import { SUPPORTED_LOCALES } from "@/lib/locales";

/** GET /api/locales: the supported languages, public and read-only. */
export function GET(): Response {
  return Response.json(SUPPORTED_LOCALES);
}
