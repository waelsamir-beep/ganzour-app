import { eq, or } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { createSession, verifyPassword } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const identity = String(body.identity ?? "").trim();
    const password = String(body.password ?? "");

    if (!identity || !password)
      return NextResponse.json({ error: "أدخل رقم الهاتف وكلمة المرور" }, { status: 400 });

    const rows = await db
      .select()
      .from(users)
      .where(or(eq(users.phone, identity), eq(users.username, identity)))
      .limit(1);
    const user = rows[0];

    if (!user || !(await verifyPassword(password, user.passwordHash)))
      return NextResponse.json({ error: "بيانات الدخول غير صحيحة" }, { status: 401 });

    if (user.status === "suspended")
      return NextResponse.json(
        { error: "تم إيقاف هذا الحساب مؤقتًا، يرجى التواصل مع الإدارة" },
        { status: 403 }
      );

    const token = await createSession(user.id);
    return NextResponse.json({
      ok: true,
      role: user.role,
      token,
    });
  } catch {
    return NextResponse.json({ error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}
