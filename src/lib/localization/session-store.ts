import { eq } from "drizzle-orm";

import type { AppDb } from "@/db/client";
import { auditLog, sessions } from "@/db/schema";

export type SessionData = {
  id: string;
  attributes: Record<string, unknown>;
  controllerState: Record<string, unknown>;
};

export type SessionStore = {
  /** The session, or undefined when none has this id. */
  load(id: string): Promise<SessionData | undefined>;
  /** Create a session with this id when it does not exist yet, and return it. */
  ensure(id: string): Promise<SessionData>;
  save(session: SessionData): Promise<void>;
  audit(entry: { sessionId: string; action: string; detail: string }): Promise<void>;
};

const parse = (text: string): Record<string, unknown> => {
  try {
    const value: unknown = JSON.parse(text);
    return value && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
};

/** Sessions kept in the `sessions` table, so they outlive any one request or process. */
export function createSessionStore(db: AppDb): SessionStore {
  const load = async (id: string): Promise<SessionData | undefined> => {
    const [row] = await db.select().from(sessions).where(eq(sessions.id, id)).limit(1);
    return row
      ? {
          id: row.id,
          attributes: parse(row.attributes),
          controllerState: parse(row.controllerState),
        }
      : undefined;
  };
  return {
    load,
    async ensure(id) {
      const now = Date.now();
      await db
        .insert(sessions)
        .values({ id, createdAt: now, updatedAt: now })
        .onConflictDoNothing();
      return (await load(id)) ?? { id, attributes: {}, controllerState: {} };
    },
    async save(session) {
      await db
        .update(sessions)
        .set({
          attributes: JSON.stringify(session.attributes),
          controllerState: JSON.stringify(session.controllerState),
          updatedAt: Date.now(),
        })
        .where(eq(sessions.id, session.id));
    },
    async audit(entry) {
      await db.insert(auditLog).values({ ...entry, createdAt: Date.now() });
    },
  };
}
