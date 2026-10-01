import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { ratings } from "@/db/schema";
import { ensureSessionUser } from "@/lib/auth";
import { fetchProfessions } from "@/lib/queries";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await ensureSessionUser();
  const { id } = await params;
  const pid = Number(id);
  if (!Number.isFinite(pid))
    return NextResponse.json({ error: "معرّف غير صالح" }, { status: 400 });

  const items = await fetchProfessions({ userId: user.id, ids: [pid] });
  const p = items[0];
  if (!p || (p.status !== "approved" && user.role !== "admin"))
    return NextResponse.json({ error: "العنصر غير موجود" }, { status: 404 });

  const myRating = await db
    .select({ stars: ratings.stars })
    .from(ratings)
    .where(and(eq(ratings.userId, user.id), eq(ratings.professionId, pid)))
    .limit(1);

  return NextResponse.json({ profession: p, userRating: myRating[0]?.stars ?? 0 });
}
