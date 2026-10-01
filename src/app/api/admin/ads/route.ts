import { desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { ads, users } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  const status = req.nextUrl.searchParams.get("status");
  const rows = await db
    .select({
      a: ads,
      uName: users.name,
      uPhone: users.phone,
    })
    .from(ads)
    .leftJoin(users, eq(ads.submittedById, users.id))
    .where(
      status === "pending" || status === "approved" || status === "rejected"
        ? eq(ads.status, status)
        : undefined
    )
    .orderBy(desc(ads.createdAt));
  return NextResponse.json({
    ads: rows.map(({ a, uName, uPhone }) => ({
      id: a.id,
      text: a.text,
      ownerName: a.ownerName,
      phone: a.phone,
      whatsapp: a.whatsapp,
      status: a.status,
      rejectionReason: a.rejectionReason,
      createdAt: a.createdAt.toISOString(),
      reviewedAt: a.reviewedAt?.toISOString() ?? null,
      userName: uName ?? "زائر",
      userPhone: uPhone ?? "—",
    })),
  });
}
