import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { CATEGORY_ICONS } from "@/lib/constants";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  const { id } = await params;
  const cid = Number(id);
  const body = await req.json();

  const patch: Record<string, unknown> = {};
  if (body.name !== undefined) {
    const name = String(body.name).trim();
    if (name.length < 2)
      return NextResponse.json({ error: "أدخل اسم القسم" }, { status: 400 });
    patch.name = name;
  }
  if (body.iconKey !== undefined) {
    if (!CATEGORY_ICONS.includes(body.iconKey as (typeof CATEGORY_ICONS)[number]))
      return NextResponse.json({ error: "أيقونة غير صالحة" }, { status: 400 });
    patch.iconKey = body.iconKey;
  }
  if (body.isActive !== undefined) patch.isActive = Boolean(body.isActive);

  const updated = await db
    .update(categories)
    .set(patch)
    .where(eq(categories.id, cid))
    .returning({ id: categories.id });
  if (updated.length === 0)
    return NextResponse.json({ error: "القسم غير موجود" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
