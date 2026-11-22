import { z } from "zod";

import { getDb } from "@/db/client";
import { createDomain, PASSWORD_MAX } from "@/lib/customer-accounts";
import { signUps, sourceOf } from "@/lib/customer-accounts/limits";
import { problem } from "@/lib/problem";

export const dynamic = "force-dynamic";

const BODY_LIMIT = 1_000_000;
const body = z.object({
  userName: z.string().min(1).max(50),
  password: z.string().min(1).max(PASSWORD_MAX),
  language: z.string().max(10).nullish(),
});

/**
 * POST /api/customers: sign up. A customer, active account, empty contact and card and a default
 * profile are created together (201), or nothing is (problem+json). Public (ACC-001).
 */
export async function POST(request: Request): Promise<Response> {
  if (Number(request.headers.get("content-length") ?? 0) > BODY_LIMIT) {
    return problem(request, 413, "Payload too large", "The body is over 1 MB");
  }
  const source = sourceOf(request.headers);
  if (!signUps.allowed(source)) {
    return problem(request, 429, "Too many requests", "Too many sign-ups from this address");
  }
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return problem(request, 400, "Bad request", "The body is not valid JSON");
  }
  const parsed = body.safeParse(json);
  if (!parsed.success) {
    return problem(request, 400, "Bad request", "userName and password are required");
  }
  signUps.record(source);
  const domain = createDomain({ db: await getDb(), now: Date.now });
  const outcome = await domain.signUp(
    { ...parsed.data, language: parsed.data.language ?? undefined },
    request.headers.get("x-session-id") ?? "anonymous",
  );
  if (outcome.ok) return Response.json({ userName: parsed.data.userName }, { status: 201 });
  const duplicate = outcome.redirect.includes("duplicate");
  return problem(
    request,
    duplicate ? 409 : 400,
    duplicate ? "User name taken" : "Account not created",
    duplicate ? "That user name is already taken" : "The account could not be created",
  );
}
