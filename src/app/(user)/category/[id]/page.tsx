"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { SearchX } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { ProviderCard } from "@/components/ProviderCard";
import { EmptyState } from "@/components/EmptyState";
import type { ProfessionDTO } from "@/lib/types";
import { api } from "@/lib/api";

export default function CategoryPage() {
  const { id } = useParams<{ id: string }>();
  const [items, setItems] = useState<ProfessionDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    api<{ professions: ProfessionDTO[] }>(`/api/professions?categoryId=${id}`)
      .then((res) => alive && setItems(res.professions))
      .catch(() => alive && setItems([]))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [id]);

  function onFavoriteChange(pid: number, fav: boolean) {
    setItems((prev) => prev.map((p) => (p.id === pid ? { ...p, isFavorite: fav } : p)));
  }

  const catName = items[0]?.categoryName ?? "القسم";

  return (
    <div className="pb-28">
      <PageHeader back title={catName} subtitle={`${items.length} خدمة معتمدة`} />
      <div className="space-y-3 px-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-2xl bg-mist" />
          ))
        ) : items.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title="لا توجد خدمات في هذا القسم بعد"
            description="كن أول من يضيف خدمة — استخدم زر إضافة مهنة."
          />
        ) : (
          items.map((p) => <ProviderCard key={p.id} p={p} onFavoriteChange={onFavoriteChange} />)
        )}
      </div>
    </div>
  );
}
