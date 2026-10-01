import { and, eq, inArray, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { ads, categories, professionRequests, professions, users } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

  const medCatRows = await db
    .select({ id: categories.id })
    .from(categories)
    .where(inArray(categories.iconKey, ["stethoscope", "hospital"]));
  const medIds = medCatRows.map((c) => c.id);

  const [membersRow, professionsRow, pendingRow, medRow, pendingAdsRow] = await Promise.all([
    db
      .select({ c: sql<number>`count(*)` })
      .from(users)
      .where(and(eq(users.role, "member"), eq(users.isGuest, false))),
    db
      .select({ c: sql<number>`count(*)` })
      .from(professions)
      .where(eq(professions.status, "approved")),
    db
      .select({ c: sql<number>`count(*)` })
      .from(professionRequests)
      .where(eq(professionRequests.status, "pending")),
    medIds.length > 0
      ? db
          .select({ c: sql<number>`count(*)` })
          .from(professions)
          .where(and(eq(professions.status, "approved"), inArray(professions.categoryId, medIds)))
      : Promise.resolve([{ c: 0 }]),
    db.select({ c: sql<number>`count(*)` }).from(ads).where(eq(ads.status, "pending")),
  ]);

  const totalApproved = Number(professionsRow[0]?.c ?? 0);
  const medical = Number(medRow[0]?.c ?? 0);

  return NextResponse.json({
    members: Number(membersRow[0]?.c ?? 0),
    professions: totalApproved,
    pending: Number(pendingRow[0]?.c ?? 0),
    medical,
    businesses: totalApproved - medical,
    pendingAds: Number(pendingAdsRow[0]?.c ?? 0),
  });
}
