/**
 * A per-process counter of events by key inside a sliding window (SEC-118 per source). It may be
 * lost on restart; the per-account lock on the sign-on record is the durable limit.
 */
export function createRateLimiter(max: number, windowMs: number, now: () => number = Date.now) {
  const events = new Map<string, number[]>();
  const recent = (key: string) => {
    const cutoff = now() - windowMs;
    const kept = (events.get(key) ?? []).filter((t) => t > cutoff);
    if (kept.length) events.set(key, kept);
    else events.delete(key);
    return kept;
  };
  return {
    /** True while the key has not used up its events. */
    allowed: (key: string): boolean => recent(key).length < max,
    /** Count one event. */
    record(key: string): void {
      events.set(key, [...recent(key), now()]);
    },
    reset: (key: string): void => void events.delete(key),
  };
}
