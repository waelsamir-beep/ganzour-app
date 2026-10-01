import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { categories, professionRequests } from "@/db/schema";
import { ensureSessionUser } from "@/lib/auth";

export async function GET() {
  const user = await ensureSessionUser();
  const rows = await db
    .select({ r: professionRequests, cName: categories.name })
    .from(professionRequests)
    .innerJoin(categories, eq(professionRequests.categoryId, categories.id))
    .where(eq(professionRequests.userId, user.id))
    .orderBy(desc(professionRequests.createdAt));
  return NextResponse.json({
    requests: rows.map(({ r, cName }) => ({
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
    })),
  });
}
