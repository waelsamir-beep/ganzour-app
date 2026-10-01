import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { ads } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  const { id } = await params;
  const aid = Number(id);
  const deleted = await db.delete(ads).where(eq(ads.id, aid)).returning({ id: ads.id });
  if (deleted.length === 0)
    return NextResponse.json({ error: "الإعلان غير موجود" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
