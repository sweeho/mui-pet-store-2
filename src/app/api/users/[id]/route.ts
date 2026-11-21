import { findUser } from "@/lib/users";

export const dynamic = "force-dynamic";

/** GET /api/users/:id: one user, or 404. */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await findUser(Number(id));
  if (!user) return Response.json({ error: "User not found" }, { status: 404 });
  return Response.json({ user });
}
