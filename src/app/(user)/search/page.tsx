"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, SearchX } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { ProviderCard } from "@/components/ProviderCard";
import { EmptyState } from "@/components/EmptyState";
import type { ProfessionDTO } from "@/lib/types";
import { api } from "@/lib/api";

function SearchContent() {
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const sortByRating = searchParams.get("sort") === "rating";
  const [items, setItems] = useState<ProfessionDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    const t = setTimeout(() => {
      api<{ professions: ProfessionDTO[] }>(
        `/api/professions${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ""}`
      )
        .then((res) => alive && setItems(res.professions))
        .catch(() => alive && setItems([]))
        .finally(() => alive && setLoading(false));
    }, 250);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [q]);

  function onFavoriteChange(id: number, fav: boolean) {
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, isFavorite: fav } : p)));
  }

  const shown = sortByRating
    ? [...items].sort((a, b) => b.avgRating - a.avgRating || b.ratingCount - a.ratingCount)
    : items;

  return (
    <div className="pb-28">
      <PageHeader
        title="البحث"
        subtitle={
          sortByRating
            ? "الأعلى تقييماً من المستخدمين أولاً"
            : q.trim()
              ? `نتائج البحث عن «${q.trim()}»`
              : "كل الخدمات المعتمدة"
        }
      />
      <div className="px-4">
        <div className="flex items-center gap-2 rounded-2xl border border-mist bg-white px-4 py-3 shadow-card focus-within:border-brand-400 focus-within:ring-4 focus-within:ring-brand-100">
          <Search className="size-5 shrink-0 text-brand-500" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ابحث عن طبيب، مهنة، خدمة أو اسم..."
            className="w-full bg-transparent text-sm font-bold outline-none placeholder:font-medium placeholder:text-ink/35"
            autoFocus
          />
        </div>

        <div className="mt-4 space-y-3">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-40 animate-pulse rounded-2xl bg-mist" />
            ))
          ) : shown.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title="لا توجد نتائج"
              description={
                q.trim()
                  ? `لم نعثر على نتائج مطابقة لـ «${q.trim()}». جرّب كلمة أخرى أو تصفح الأقسام.`
                  : "لا توجد خدمات معتمدة بعد."
              }
            />
          ) : (
            shown.map((p) => <ProviderCard key={p.id} p={p} onFavoriteChange={onFavoriteChange} />)
          )}
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchContent />
    </Suspense>
  );
}
