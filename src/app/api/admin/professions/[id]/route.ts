import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { categories, professions } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  const { id } = await params;
  const pid = Number(id);
  const body = await req.json();

  const patch: Record<string, unknown> = {};
  const strFields = [
    "ownerName",
    "title",
    "phone",
    "whatsapp",
    "address",
    "description",
    "workingHours",
    "mapUrl",
    "imageUrl",
  ] as const;
  for (const f of strFields) {
    if (body[f] !== undefined) {
      const v = String(body[f]).trim();
      patch[f] = v === "" ? null : v;
    }
  }
  if (body.ownerName !== undefined && String(body.ownerName).trim() === "")
    return NextResponse.json({ error: "الاسم مطلوب" }, { status: 400 });
  if (body.title !== undefined && String(body.title).trim() === "")
    return NextResponse.json({ error: "المهنة مطلوبة" }, { status: 400 });
  if (body.phone !== undefined && String(body.phone).trim() === "")
    return NextResponse.json({ error: "رقم الهاتف مطلوب" }, { status: 400 });

  if (body.categoryId !== undefined) {
    const cid = Number(body.categoryId);
    const cat = await db.select({ id: categories.id }).from(categories).where(eq(categories.id, cid)).limit(1);
    if (cat.length === 0) return NextResponse.json({ error: "القسم غير موجود" }, { status: 400 });
    patch.categoryId = cid;
  }
  if (body.status !== undefined) {
    if (body.status !== "approved" && body.status !== "hidden")
      return NextResponse.json({ error: "حالة غير صالحة" }, { status: 400 });
    patch.status = body.status;
  }

  const updated = await db
    .update(professions)
    .set(patch)
    .where(eq(professions.id, pid))
    .returning({ id: professions.id });
  if (updated.length === 0)
    return NextResponse.json({ error: "العنصر غير موجود" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  const { id } = await params;
  const pid = Number(id);
  const deleted = await db.delete(professions).where(eq(professions.id, pid)).returning({ id: professions.id });
  if (deleted.length === 0)
    return NextResponse.json({ error: "العنصر غير موجود" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
