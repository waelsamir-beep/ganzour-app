import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { notifications, users } from "@/db/schema";
import { ensureSessionUser } from "@/lib/auth";

export async function POST(req: Request) {
  const user = await ensureSessionUser();
  try {
    const body = await req.json();
    const name = String(body.name ?? "").trim();
    const message = String(body.message ?? "").trim();
    if (name.length < 2)
      return NextResponse.json({ error: "اكتب اسمك من فضلك" }, { status: 400 });
    if (message.length < 5)
      return NextResponse.json({ error: "اكتب رسالتك أولًا" }, { status: 400 });

    const admins = await db.select({ id: users.id }).from(users).where(eq(users.role, "admin"));
    if (admins.length > 0) {
      await db.insert(notifications).values(
        admins.map((a) => ({
          userId: a.id,
          title: "💬 رسالة جديدة من التطبيق",
          body: `${name} (${user.phone}): ${message}`,
          kind: "request",
        }))
      );
    }
    await db.insert(notifications).values({
      userId: user.id,
      title: "تم إرسال رسالتك ✅",
      body: "وصلتنا رسالتك وسيتواصل معك فريق الإدارة في أقرب وقت.",
      kind: "info",
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}
