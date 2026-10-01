import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { notifications, professionRequests, professions } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  const { id } = await params;
  const rid = Number(id);

  const rows = await db
    .select()
    .from(professionRequests)
    .where(eq(professionRequests.id, rid))
    .limit(1);
  const request = rows[0];
  if (!request) return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });
  if (request.status !== "pending")
    return NextResponse.json({ error: "تمت مراجعة هذا الطلب بالفعل" }, { status: 409 });

  await db.transaction(async (tx) => {
    await tx
      .update(professionRequests)
      .set({ status: "approved", reviewedAt: new Date() })
      .where(eq(professionRequests.id, rid));

    await tx.insert(professions).values({
      ownerName: request.ownerName,
      title: request.title,
      categoryId: request.categoryId,
      phone: request.phone,
      whatsapp: request.whatsapp,
      address: request.address,
      description: request.description,
      workingHours: request.workingHours,
      mapUrl: request.mapUrl,
      status: "approved",
      submittedById: request.userId,
    });

    await tx.insert(notifications).values({
      userId: request.userId,
      title: "تم اعتماد مهنتك بنجاح 🎉",
      body: `تمت الموافقة على طلب «${request.title}» وأصبح ظاهرًا الآن لجميع أعضاء الدليل.`,
      kind: "request",
    });
  });

  return NextResponse.json({ ok: true });
}
