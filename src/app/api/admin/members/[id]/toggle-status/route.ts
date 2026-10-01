import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  const { id } = await params;
  const uid = Number(id);

  const rows = await db.select().from(users).where(eq(users.id, uid)).limit(1);
  const target = rows[0];
  if (!target) return NextResponse.json({ error: "العضو غير موجود" }, { status: 404 });
  if (target.role === "admin")
    return NextResponse.json({ error: "لا يمكن تعديل حالة حساب إداري" }, { status: 400 });

  const nextStatus = target.status === "active" ? "suspended" : "active";
  await db.update(users).set({ status: nextStatus }).where(eq(users.id, uid));
  return NextResponse.json({ ok: true, status: nextStatus });
}
