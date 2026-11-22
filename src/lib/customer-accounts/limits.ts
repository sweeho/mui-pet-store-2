import { createRateLimiter } from "./rate-limit";

const HOUR = 3_600_000;

/** Failed sign-ons per source: 20 in 15 minutes (SEC-118; the per-account lock is on the sign-on record). */
export const signOnFailures = createRateLimiter(20, 15 * 60_000);
/** Sign-ups per source: 100 an hour. */
export const signUps = createRateLimiter(100, HOUR);

/**
 * The caller's address as the load balancer appended it: the LAST `X-Forwarded-For` entry, because
 * a client can write the earlier ones. Without a proxy in front (development) all callers share one bucket.
 */
export const sourceOf = (headers: Headers): string =>
  headers.get("x-forwarded-for")?.split(",").at(-1)?.trim() || headers.get("x-real-ip") || "local";
