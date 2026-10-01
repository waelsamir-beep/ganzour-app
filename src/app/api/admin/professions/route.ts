import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { fetchProfessions } from "@/lib/queries";

export async function GET(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  const sp = req.nextUrl.searchParams;
  const items = await fetchProfessions({
    userId: admin.id,
    q: sp.get("q") ?? undefined,
    categoryId: sp.get("categoryId") ? Number(sp.get("categoryId")) : undefined,
    includeHidden: true,
  });
  return NextResponse.json({ professions: items });
}
