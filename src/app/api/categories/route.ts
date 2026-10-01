import { asc, eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { categories, professions } from "@/db/schema";

export async function GET() {
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
    .where(eq(categories.isActive, true))
    .groupBy(categories.id)
    .orderBy(asc(categories.sortOrder));
  return NextResponse.json({
    categories: rows.map((r) => ({ ...r, count: Number(r.count) })),
  });
}
