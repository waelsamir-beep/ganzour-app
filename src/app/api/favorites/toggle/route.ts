import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { favorites } from "@/db/schema";
import { ensureSessionUser } from "@/lib/auth";

export async function POST(req: Request) {
  const user = await ensureSessionUser();
  const body = await req.json();
  const professionId = Number(body.professionId);
  if (!Number.isFinite(professionId))
    return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 });

  const existing = await db
    .select({ id: favorites.id })
    .from(favorites)
    .where(and(eq(favorites.userId, user.id), eq(favorites.professionId, professionId)))
    .limit(1);

  if (existing.length > 0) {
    await db.delete(favorites).where(eq(favorites.id, existing[0].id));
    return NextResponse.json({ ok: true, favorite: false });
  }
  await db.insert(favorites).values({ userId: user.id, professionId });
  return NextResponse.json({ ok: true, favorite: true });
}
