import { and, eq, not } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { favorites, notifications, professionRequests, users } from "@/db/schema";
import { createSession, ensureSessionUser } from "@/lib/auth";
// ملاحظة: يُرجَع التوكن في الاستجابة ليعمل الدخول حتى داخل iframes بدون كوكيز
import { normalizePhone } from "@/lib/utils";

/** دخول بدون كلمة مرور: اسم + رقم موبايل + صورة شخصية */
export async function POST(req: Request) {
  const user = await ensureSessionUser();
  try {
    const body = await req.json();
    const name = String(body.name ?? "").trim();
    const phone = normalizePhone(String(body.phone ?? ""));
    const imageUrl =
      typeof body.imageUrl === "string" && body.imageUrl.startsWith("data:image/")
        ? body.imageUrl
        : null;

    if (name.length < 3)
      return NextResponse.json({ error: "من فضلك اكتب اسمك بالكامل" }, { status: 400 });
    if (!/^[0-9]{10,12}$/.test(phone))
      return NextResponse.json({ error: "من فضلك اكتب رقم موبايل صحيح" }, { status: 400 });
    if (imageUrl && imageUrl.length > 400_000)
      return NextResponse.json({ error: "حجم الصورة كبير جدًا" }, { status: 400 });

    // لو الرقم مسجل بالفعل → دخول مباشر لنفس الحساب (بدون كلمة مرور)
    const existingRows = await db
      .select()
      .from(users)
      .where(eq(users.phone, phone))
      .limit(1);
    const existing = existingRows[0];

    if (existing) {
      if (existing.status !== "active")
        return NextResponse.json(
          { error: "تم إيقاف هذا الحساب مؤقتًا، تواصل مع الإدارة" },
          { status: 403 }
        );

      // تنظيف حساب الزائر المؤقت الحالي إن لم يُستخدم
      if (user.isGuest && !user.onboarded && existing.id !== user.id) {
        const favRows = await db
          .select({ id: favorites.id })
          .from(favorites)
          .where(eq(favorites.userId, user.id))
          .limit(1);
        const reqRows = await db
          .select({ id: professionRequests.id })
          .from(professionRequests)
          .where(eq(professionRequests.userId, user.id))
          .limit(1);
        if (favRows.length === 0 && reqRows.length === 0) {
          await db.delete(users).where(eq(users.id, user.id));
        }
      }

      const patch: Record<string, unknown> = {};
      if (imageUrl) patch.imageUrl = imageUrl;
      if (!existing.onboarded) {
        patch.onboarded = true;
        patch.isGuest = false;
        if (existing.role !== "admin") patch.name = name;
      }
      if (Object.keys(patch).length > 0) {
        await db.update(users).set(patch).where(eq(users.id, existing.id));
      }
      const token = await createSession(existing.id);
      return NextResponse.json({ ok: true, role: existing.role, token });
    }

    // رقم جديد تمامًا → تفعيل الحساب الحالي
    const taken = await db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.phone, phone), not(eq(users.id, user.id))))
      .limit(1);
    if (taken.length > 0)
      return NextResponse.json({ error: "رقم الموبايل مستخدم بالفعل" }, { status: 409 });

    await db
      .update(users)
      .set({ name, phone, imageUrl, onboarded: true, isGuest: false })
      .where(eq(users.id, user.id));

    await db.insert(notifications).values({
      userId: user.id,
      title: "أهلًا بك في الدليل المهني لقرية جنزور 👋",
      body: "تم تفعيل حسابك بنجاح. يمكنك الآن استخدام المفضلة وإرسال الطلبات والتواصل مع كل خدمات القرية.",
      kind: "info",
    });

    const token = await createSession(user.id);
    return NextResponse.json({ ok: true, role: user.role, token });
  } catch {
    return NextResponse.json({ error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}
