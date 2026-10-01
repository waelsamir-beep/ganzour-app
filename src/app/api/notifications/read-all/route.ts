import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { ensureSessionUser } from "@/lib/auth";

export async function POST() {
  const user = await ensureSessionUser();
  await db
    .update(notifications)
    .set({ read: true })
    .where(and(eq(notifications.userId, user.id), eq(notifications.read, false)));
  return NextResponse.json({ ok: true });
}
