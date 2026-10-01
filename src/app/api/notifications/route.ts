import { desc, eq, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { ensureSessionUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = await ensureSessionUser();

  if (req.nextUrl.searchParams.get("unread") === "1") {
    const [row] = await db
      .select({ count: sql<number>`count(*)` })
      .from(notifications)
      .where(sql`${notifications.userId} = ${user.id} AND ${notifications.read} = false`);
    return NextResponse.json({ count: Number(row?.count ?? 0) });
  }

  const rows = await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, user.id))
    .orderBy(desc(notifications.createdAt))
    .limit(60);
  return NextResponse.json({
    notifications: rows.map((n) => ({
      id: n.id,
      title: n.title,
      body: n.body,
      kind: n.kind,
      read: n.read,
      createdAt: n.createdAt.toISOString(),
    })),
  });
}
