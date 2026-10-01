import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getSessionUser, hashPassword, verifyPassword } from "@/lib/auth";

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== "admin")
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  const body = await req.json();
  const current = String(body.current ?? "");
  const next = String(body.next ?? "");
  const confirm = String(body.confirm ?? "");

  const rows = await db.select().from(users).where(eq(users.id, user.id)).limit(1);
  const dbUser = rows[0];
  if (!dbUser) return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });

  if (!(await verifyPassword(current, dbUser.passwordHash)))
    return NextResponse.json({ error: "كلمة المرور الحالية غير صحيحة" }, { status: 400 });
  if (next.length < 6)
    return NextResponse.json({ error: "كلمة المرور الجديدة يجب ألا تقل عن 6 أحرف" }, { status: 400 });
  if (next !== confirm)
    return NextResponse.json({ error: "كلمتا المرور غير متطابقتين" }, { status: 400 });

  const passwordHash = await hashPassword(next);
  await db.update(users).set({ passwordHash }).where(eq(users.id, user.id));
  return NextResponse.json({ ok: true });
}
