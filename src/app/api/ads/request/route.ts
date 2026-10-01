import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { ads, notifications, users } from "@/db/schema";
import { ensureSessionUser } from "@/lib/auth";
import { normalizePhone } from "@/lib/utils";

export async function POST(req: Request) {
  const user = await ensureSessionUser();
  try {
    const body = await req.json();
    const text = String(body.text ?? "").trim();
    const ownerName = String(body.ownerName ?? "").trim();
    const phone = normalizePhone(String(body.phone ?? ""));
    const whatsapp = normalizePhone(String(body.whatsapp ?? "")) || null;

    if (text.length < 6 || text.length > 160)
      return NextResponse.json(
        { error: "نص الإعلان يجب أن يكون بين 6 و160 حرفًا" },
        { status: 400 }
      );
    if (ownerName.length < 3)
      return NextResponse.json({ error: "أدخل اسم صاحب الإعلان" }, { status: 400 });
    if (!/^[0-9]{10,12}$/.test(phone))
      return NextResponse.json({ error: "أدخل رقم هاتف صحيح" }, { status: 400 });

    await db.insert(ads).values({
      text,
      ownerName,
      phone,
      whatsapp,
      status: "pending",
      submittedById: user.id,
    });

    await db.insert(notifications).values({
      userId: user.id,
      title: "تم استلام طلب الإعلان ✅",
      body: "تم إرسال إعلانك إلى الإدارة للمراجعة، وبعدها سيظهر في الشريط الإعلاني بالصفحة الرئيسية.",
      kind: "request",
    });

    const admins = await db.select({ id: users.id }).from(users).where(eq(users.role, "admin"));
    if (admins.length > 0) {
      await db.insert(notifications).values(
        admins.map((a) => ({
          userId: a.id,
          title: "🔔 طلب إعلان جديد",
          body: `قام أحد الأعضاء بطلب إعلان في الماركيو: «${text}»`,
          kind: "request",
        }))
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}
