import { eq } from "drizzle-orm";

import { getDb } from "@/db/client";
import { users } from "@/db/schema";

export interface User {
  id: number;
  name: string;
  email: string;
}

/** Every user, by id. */
export async function listUsers(): Promise<User[]> {
  const db = await getDb();
  return db.select().from(users).orderBy(users.id);
}

/** One user, or null. */
export async function findUser(id: number): Promise<User | null> {
  if (!Number.isInteger(id)) return null;
  const db = await getDb();
  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return user ?? null;
}
