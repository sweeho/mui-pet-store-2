/** An RFC 9457 problem+json response. It carries the request id and never a stack trace. */
export function problem(
  request: Request,
  status: number,
  title: string,
  detail?: string,
): Response {
  const requestId = request.headers.get("x-request-id") ?? undefined;
  return new Response(JSON.stringify({ type: "about:blank", title, status, detail, requestId }), {
    status,
    headers: {
      "Content-Type": "application/problem+json",
      ...(requestId ? { "X-Request-Id": requestId } : {}),
    },
  });
}

/** A same-origin path to return to, else "/". Refuses absolute URLs, "//host" and API paths. */
export function safeFrom(from: string | null | undefined): string {
  if (!from || !from.startsWith("/") || from.startsWith("//") || from.includes("\\")) return "/";
  if (from === "/api" || from.startsWith("/api/")) return "/";
  return from;
}
