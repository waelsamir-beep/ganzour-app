import { asc, eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { categories, professions } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { CATEGORY_ICONS } from "@/lib/constants";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  const rows = await db
    .select({
      id: categories.id,
      name: categories.name,
      iconKey: categories.iconKey,
      sortOrder: categories.sortOrder,
      isActive: categories.isActive,
      count: sql<number>`count(${professions.id})`,
    })
    .from(categories)
    .leftJoin(professions, eq(professions.categoryId, categories.id))
    .groupBy(categories.id)
    .orderBy(asc(categories.sortOrder));
  return NextResponse.json({
    categories: rows.map((r) => ({ ...r, count: Number(r.count) })),
  });
}

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  const body = await req.json();
  const name = String(body.name ?? "").trim();
  const iconKey = String(body.iconKey ?? "folder");
  if (name.length < 2)
    return NextResponse.json({ error: "أدخل اسم القسم" }, { status: 400 });
  if (!CATEGORY_ICONS.includes(iconKey as (typeof CATEGORY_ICONS)[number]))
    return NextResponse.json({ error: "أيقونة غير صالحة" }, { status: 400 });

  const [maxRow] = await db.select({ m: sql<number>`coalesce(max(${categories.sortOrder}), 0)` }).from(categories);
  const [cat] = await db
    .insert(categories)
    .values({ name, iconKey, sortOrder: Number(maxRow?.m ?? 0) + 1 })
    .returning();
  return NextResponse.json({ ok: true, category: cat });
}
