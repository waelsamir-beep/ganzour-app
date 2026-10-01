"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { HeartOff } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { ProviderCard } from "@/components/ProviderCard";
import { EmptyState } from "@/components/EmptyState";
import type { ProfessionDTO } from "@/lib/types";
import { api } from "@/lib/api";

export default function FavoritesPage() {
  const [items, setItems] = useState<ProfessionDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    api<{ professions: ProfessionDTO[] }>("/api/favorites")
      .then((res) => alive && setItems(res.professions))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  function onFavoriteChange(id: number, fav: boolean) {
    if (!fav) setItems((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div className="pb-28">
      <PageHeader title="المفضلة" subtitle="العناصر التي حفظتها للرجوع إليها بسهولة" />
      <div className="space-y-3 px-4">
        {loading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-2xl bg-mist" />
          ))
        ) : items.length === 0 ? (
          <EmptyState
            icon={HeartOff}
            title="لا توجد عناصر في المفضلة"
            description="اضغط على زر القلب في أي بطاقة خدمة لحفظها هنا."
            action={
              <Link
                href="/search"
                className="mt-2 rounded-xl bg-brand-700 px-5 py-2.5 text-sm font-extrabold text-white transition hover:bg-brand-800"
              >
                تصفح الخدمات
              </Link>
            }
          />
        ) : (
          items.map((p) => <ProviderCard key={p.id} p={p} onFavoriteChange={onFavoriteChange} />)
        )}
      </div>
    </div>
  );
}
