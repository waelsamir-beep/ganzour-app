import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { ads } from "@/db/schema";

/** الإعلانات المعتمدة فقط — تُعرض في الماركيو بالرئيسية */
export async function GET() {
  const rows = await db
    .select()
    .from(ads)
    .where(eq(ads.status, "approved"))
    .orderBy(desc(ads.createdAt))
    .limit(30);
  return NextResponse.json({
    ads: rows.map((a) => ({
      id: a.id,
      text: a.text,
      ownerName: a.ownerName,
      phone: a.phone,
      whatsapp: a.whatsapp,
      status: a.status,
      rejectionReason: null,
      createdAt: a.createdAt.toISOString(),
      reviewedAt: a.reviewedAt?.toISOString() ?? null,
    })),
  });
}
