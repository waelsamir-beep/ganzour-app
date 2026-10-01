import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { ensureSessionUser } from "@/lib/auth";

export async function GET() {
  const user = await ensureSessionUser();
  return NextResponse.json({ user });
}

export async function PATCH(req: Request) {
  const user = await ensureSessionUser();
  try {
    const body = await req.json();
    const name = String(body.name ?? "").trim();
    const emailRaw = String(body.email ?? "").trim();
    const phoneRaw = String(body.phone ?? "").replace(/[^\d]/g, "");

    if (name && name.length >= 3) {
      await db.update(users).set({ name }).where(eq(users.id, user.id));
    }
    if (emailRaw !== "" && /^\S+@\S+\.\S+$/.test(emailRaw)) {
      await db.update(users).set({ email: emailRaw }).where(eq(users.id, user.id));
    } else if (emailRaw === "" && body.email !== undefined) {
      await db.update(users).set({ email: null }).where(eq(users.id, user.id));
    }
    if (phoneRaw && /^[0-9]{10,12}$/.test(phoneRaw) && phoneRaw !== user.phone) {
      const taken = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.phone, phoneRaw))
        .limit(1);
      if (taken.length > 0)
        return NextResponse.json({ error: "رقم الهاتف مستخدم بالفعل" }, { status: 409 });
      await db.update(users).set({ phone: phoneRaw }).where(eq(users.id, user.id));
    }
    if (body.imageUrl !== undefined) {
      const img = body.imageUrl;
      if (img === null || img === "") {
        await db.update(users).set({ imageUrl: null }).where(eq(users.id, user.id));
      } else if (typeof img === "string" && img.startsWith("data:image/") && img.length <= 400_000) {
        await db.update(users).set({ imageUrl: img }).where(eq(users.id, user.id));
      }
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}
