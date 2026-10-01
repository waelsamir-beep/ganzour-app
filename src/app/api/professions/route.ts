import { NextRequest, NextResponse } from "next/server";
import { ensureSessionUser } from "@/lib/auth";
import { fetchProfessions } from "@/lib/queries";

export async function GET(req: NextRequest) {
  const user = await ensureSessionUser();
  const sp = req.nextUrl.searchParams;
  const categoryId = sp.get("categoryId");
  const items = await fetchProfessions({
    userId: user.id,
    q: sp.get("q") ?? undefined,
    categoryId: categoryId ? Number(categoryId) : undefined,
  });
  return NextResponse.json({ professions: items });
}
