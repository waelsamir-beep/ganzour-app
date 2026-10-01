import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { categories, notifications, professionRequests, users } from "@/db/schema";
import { ensureSessionUser } from "@/lib/auth";
import { normalizePhone } from "@/lib/utils";

export async function POST(req: Request) {
  const user = await ensureSessionUser();
  try {
    const body = await req.json();
    const ownerName = String(body.ownerName ?? "").trim();
    const title = String(body.title ?? "").trim();
    const categoryId = Number(body.categoryId);
    const phone = normalizePhone(String(body.phone ?? ""));
    const whatsapp = normalizePhone(String(body.whatsapp ?? "")) || null;
    const address = String(body.address ?? "").trim() || null;
    const description = String(body.description ?? "").trim() || null;
    const workingHours = String(body.workingHours ?? "").trim() || null;
    const mapUrl = String(body.mapUrl ?? "").trim() || null;

    if (ownerName.length < 3)
      return NextResponse.json({ error: "أدخل اسم صاحب المهنة" }, { status: 400 });
    if (title.length < 2)
      return NextResponse.json({ error: "أدخل اسم المهنة أو النشاط" }, { status: 400 });
    if (!Number.isFinite(categoryId) || categoryId <= 0)
      return NextResponse.json({ error: "اختر القسم المناسب" }, { status: 400 });
    if (!/^[0-9]{10,12}$/.test(phone))
      return NextResponse.json({ error: "أدخل رقم هاتف صحيح" }, { status: 400 });
    if (mapUrl && !/^https?:\/\//.test(mapUrl))
      return NextResponse.json({ error: "رابط الخريطة غير صحيح" }, { status: 400 });

    const cat = await db.select({ id: categories.id }).from(categories).where(eq(categories.id, categoryId)).limit(1);
    if (cat.length === 0)
      return NextResponse.json({ error: "القسم غير موجود" }, { status: 400 });

    await db.insert(professionRequests).values({
      userId: user.id,
      ownerName,
      title,
      categoryId,
      phone,
      whatsapp,
      address,
      description,
      workingHours,
      mapUrl,
      status: "pending",
    });

    await db.insert(notifications).values({
      userId: user.id,
      title: "تم استلام طلب إضافة المهنة ✅",
      body: `تم إرسال طلب «${title}» إلى الإدارة، وسيتم مراجعة البيانات قبل نشرها في الدليل.`,
      kind: "request",
    });

    const admins = await db.select({ id: users.id }).from(users).where(eq(users.role, "admin"));
    if (admins.length > 0) {
      await db.insert(notifications).values(
        admins.map((a) => ({
          userId: a.id,
          title: "🔔 طلب مهنة جديد",
          body: `قام أحد الأعضاء بإرسال طلب لإضافة مهنة جديدة: ${title}`,
          kind: "request",
        }))
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}
