export const MINUTE = 60_000;
/** A signed-on session ends after this idle time (SEC-116, the stricter legacy value). */
export const SIGNED_ON_IDLE_MS = 15 * MINUTE;
/** A signed-on session ends this long after sign-in, whatever the activity. */
export const SIGNED_ON_MAX_AGE_MS = 8 * 60 * MINUTE;
/** The anonymous shopper session ends after this idle time. */
export const ANONYMOUS_IDLE_MS = 30 * MINUTE;

export type SessionClock = {
  signedOn: boolean;
  /** When the user signed on (ms). */
  signedAt?: number;
  /** The last request (ms). */
  lastActive: number;
  now: number;
};

/** What one request finds: whether the session ended, and whether the visitor must sign on again. */
export function evaluateSession(s: SessionClock): { expired: boolean; signOnRequired: boolean } {
  if (!s.signedOn) return { expired: s.now - s.lastActive >= ANONYMOUS_IDLE_MS, signOnRequired: false };
  const expired =
    s.now - s.lastActive >= SIGNED_ON_IDLE_MS ||
    s.now - (s.signedAt ?? s.lastActive) >= SIGNED_ON_MAX_AGE_MS;
  return { expired, signOnRequired: expired };
}
