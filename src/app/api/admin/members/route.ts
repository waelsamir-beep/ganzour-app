import { desc, eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { professionRequests, users } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      phone: users.phone,
      email: users.email,
      role: users.role,
      status: users.status,
      createdAt: users.createdAt,
      requestsCount: sql<number>`count(${professionRequests.id})`,
    })
    .from(users)
    .leftJoin(professionRequests, eq(professionRequests.userId, users.id))
    .where(eq(users.isGuest, false))
    .groupBy(users.id)
    .orderBy(desc(users.createdAt));

  return NextResponse.json({
    members: rows.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
      requestsCount: Number(r.requestsCount),
    })),
  });
}
