import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { ads, notifications } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  const { id } = await params;
  const aid = Number(id);

  const rows = await db.select().from(ads).where(eq(ads.id, aid)).limit(1);
  const ad = rows[0];
  if (!ad) return NextResponse.json({ error: "الإعلان غير موجود" }, { status: 404 });
  if (ad.status !== "pending")
    return NextResponse.json({ error: "تمت مراجعة هذا الإعلان بالفعل" }, { status: 409 });

  await db.transaction(async (tx) => {
    await tx
      .update(ads)
      .set({ status: "approved", reviewedAt: new Date() })
      .where(eq(ads.id, aid));
    if (ad.submittedById) {
      await tx.insert(notifications).values({
        userId: ad.submittedById,
        title: "إعلانك شغال دلوقتي 🎉",
        body: "تمت الموافقة على إعلانك وأصبح ظاهرًا في الشريط الإعلاني بالصفحة الرئيسية لجميع الأهالي.",
        kind: "success",
      });
    }
  });

  return NextResponse.json({ ok: true });
}
