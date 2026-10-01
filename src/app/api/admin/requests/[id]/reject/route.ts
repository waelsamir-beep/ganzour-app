import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { notifications, professionRequests } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  const { id } = await params;
  const rid = Number(id);
  const body = await req.json();
  const reason = String(body.reason ?? "").trim();

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
      .set({ status: "rejected", rejectionReason: reason || null, reviewedAt: new Date() })
      .where(eq(professionRequests.id, rid));

    await tx.insert(notifications).values({
      userId: request.userId,
      title: "لم تتم الموافقة على طلبك",
      body: reason
        ? `طلب «${request.title}» لم تتم الموافقة عليه. السبب: ${reason}. يمكنك إرسال طلب جديد بعد تعديل البيانات.`
        : `طلب «${request.title}» لم تتم الموافقة عليه. يمكنك مراجعة البيانات وإرسال طلب جديد.`,
      kind: "request",
    });
  });

  return NextResponse.json({ ok: true });
}
