import { and, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { categories, favorites, professions, ratings } from "@/db/schema";
import type { ProfessionDTO } from "./types";

export async function fetchProfessions(opts: {
  userId: number | null;
  q?: string;
  categoryId?: number;
  includeHidden?: boolean;
  ids?: number[];
}): Promise<ProfessionDTO[]> {
  const q = opts.q?.trim();
  const where = and(
    opts.includeHidden ? undefined : eq(professions.status, "approved"),
    opts.categoryId ? eq(professions.categoryId, opts.categoryId) : undefined,
    opts.ids && opts.ids.length > 0 ? inArray(professions.id, opts.ids) : undefined,
    opts.ids && opts.ids.length === 0 ? sql`1 = 0` : undefined,
    q
      ? or(
          ilike(professions.ownerName, `%${q}%`),
          ilike(professions.title, `%${q}%`),
          ilike(professions.description, `%${q}%`),
          ilike(professions.address, `%${q}%`),
          ilike(categories.name, `%${q}%`)
        )
      : undefined
  );

  const rows = await db
    .select({
      p: professions,
      cName: categories.name,
      cIcon: categories.iconKey,
    })
    .from(professions)
    .innerJoin(categories, eq(professions.categoryId, categories.id))
    .where(where)
    .orderBy(desc(professions.createdAt));

  if (rows.length === 0) return [];
  const ids = rows.map((r) => r.p.id);

  const [ratingRows, favRows] = await Promise.all([
    db
      .select({
        pid: ratings.professionId,
        avg: sql<number>`avg(${ratings.stars})`,
        count: sql<number>`count(*)`,
      })
      .from(ratings)
      .where(inArray(ratings.professionId, ids))
      .groupBy(ratings.professionId),
    opts.userId
      ? db
          .select({ pid: favorites.professionId })
          .from(favorites)
          .where(and(eq(favorites.userId, opts.userId), inArray(favorites.professionId, ids)))
      : Promise.resolve([] as { pid: number }[]),
  ]);

  const ratingMap = new Map(ratingRows.map((r) => [r.pid, r]));
  const favSet = new Set(favRows.map((f) => f.pid));

  return rows.map(({ p, cName, cIcon }) => ({
    id: p.id,
    ownerName: p.ownerName,
    title: p.title,
    categoryId: p.categoryId,
    categoryName: cName,
    categoryIcon: cIcon,
    phone: p.phone,
    whatsapp: p.whatsapp,
    address: p.address,
    description: p.description,
    workingHours: p.workingHours,
    mapUrl: p.mapUrl,
    lat: p.lat,
    lng: p.lng,
    imageUrl: p.imageUrl,
    status: p.status,
    createdAt: p.createdAt.toISOString(),
    avgRating: ratingMap.get(p.id) ? Number(ratingMap.get(p.id)!.avg) : 0,
    ratingCount: ratingMap.get(p.id) ? Number(ratingMap.get(p.id)!.count) : 0,
    isFavorite: favSet.has(p.id),
  }));
}
