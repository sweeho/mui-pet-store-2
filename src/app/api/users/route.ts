import { listUsers } from "@/lib/users";

export const dynamic = "force-dynamic";

/** GET /api/users: every user, from the database. */
export async function GET() {
  return Response.json({ users: await listUsers() });
}
