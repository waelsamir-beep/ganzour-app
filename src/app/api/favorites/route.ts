import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { favorites } from "@/db/schema";
import { ensureSessionUser } from "@/lib/auth";
import { fetchProfessions } from "@/lib/queries";

export async function GET() {
  const user = await ensureSessionUser();
  const rows = await db
    .select({ pid: favorites.professionId })
    .from(favorites)
    .where(eq(favorites.userId, user.id))
    .orderBy(desc(favorites.createdAt));
  const professions = await fetchProfessions({
    userId: user.id,
    ids: rows.map((r) => r.pid),
  });
  const order = new Map(rows.map((r, i) => [r.pid, i]));
  professions.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
  return NextResponse.json({ professions });
}
