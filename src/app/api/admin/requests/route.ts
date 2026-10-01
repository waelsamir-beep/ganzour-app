import { desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { categories, professionRequests, users } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  const status = req.nextUrl.searchParams.get("status");
  const rows = await db
    .select({
      r: professionRequests,
      cName: categories.name,
      uName: users.name,
      uPhone: users.phone,
    })
    .from(professionRequests)
    .innerJoin(categories, eq(professionRequests.categoryId, categories.id))
    .innerJoin(users, eq(professionRequests.userId, users.id))
    .where(
      status === "pending" || status === "approved" || status === "rejected"
        ? eq(professionRequests.status, status)
        : undefined
    )
    .orderBy(desc(professionRequests.createdAt));
  return NextResponse.json({
    requests: rows.map(({ r, cName, uName, uPhone }) => ({
      id: r.id,
      ownerName: r.ownerName,
      title: r.title,
      categoryId: r.categoryId,
      categoryName: cName,
      phone: r.phone,
      whatsapp: r.whatsapp,
      address: r.address,
      description: r.description,
      workingHours: r.workingHours,
      mapUrl: r.mapUrl,
      status: r.status,
      rejectionReason: r.rejectionReason,
      createdAt: r.createdAt.toISOString(),
      reviewedAt: r.reviewedAt?.toISOString() ?? null,
      userName: uName,
      userPhone: uPhone,
    })),
  });
}
