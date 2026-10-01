import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { professions, ratings } from "@/db/schema";
import { ensureSessionUser } from "@/lib/auth";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await ensureSessionUser();
  const { id } = await params;
  const pid = Number(id);
  const body = await req.json();
  const stars = Number(body.stars);

  if (!Number.isInteger(stars) || stars < 1 || stars > 5)
    return NextResponse.json({ error: "اختر تقييمًا من 1 إلى 5" }, { status: 400 });

  const p = await db
    .select({ id: professions.id })
    .from(professions)
    .where(and(eq(professions.id, pid), eq(professions.status, "approved")))
    .limit(1);
  if (p.length === 0) return NextResponse.json({ error: "العنصر غير موجود" }, { status: 404 });

  await db
    .insert(ratings)
    .values({ userId: user.id, professionId: pid, stars })
    .onConflictDoUpdate({
      target: [ratings.userId, ratings.professionId],
      set: { stars },
    });

  return NextResponse.json({ ok: true });
}
