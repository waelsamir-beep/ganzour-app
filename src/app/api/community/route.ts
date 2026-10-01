import { and, desc, eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { categories, professions, ratings, users } from "@/db/schema";

export async function GET() {
  const [memberRows, profRows, catRows, ratingRows, topRow, visitorRows] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(and(eq(users.status, "active"), eq(users.isGuest, false))),
    db
      .select({ count: sql<number>`count(*)` })
      .from(professions)
      .where(eq(professions.status, "approved")),
    db
      .select({ count: sql<number>`count(*)` })
      .from(categories)
      .where(eq(categories.isActive, true)),
    db.select({ count: sql<number>`count(*)` }).from(ratings),
    db
      .select({
        pid: ratings.professionId,
        avg: sql<number>`avg(${ratings.stars})`,
        cnt: sql<number>`count(*)`,
      })
      .from(ratings)
      .groupBy(ratings.professionId)
      .orderBy(desc(sql`avg(${ratings.stars})`), desc(sql`count(*)`))
      .limit(1),
    db.select({ count: sql<number>`count(*)` }).from(users),
  ]);

  let topRated: { id: number; name: string } | null = null;
  if (topRow[0]) {
    const p = await db
      .select({ id: professions.id, ownerName: professions.ownerName })
      .from(professions)
      .where(and(eq(professions.id, topRow[0].pid), eq(professions.status, "approved")))
      .limit(1);
    if (p[0]) topRated = { id: p[0].id, name: p[0].ownerName };
  }

  return NextResponse.json({
    members: Number(memberRows[0]?.count ?? 0),
    professions: Number(profRows[0]?.count ?? 0),
    categories: Number(catRows[0]?.count ?? 0),
    ratings: Number(ratingRows[0]?.count ?? 0),
    topRated,
    visitors: Number(visitorRows[0]?.count ?? 0),
  });
}
