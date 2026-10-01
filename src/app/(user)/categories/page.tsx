"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, FolderOpen } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { CategoryIcon } from "@/components/CategoryIcon";
import { EmptyState } from "@/components/EmptyState";
import type { CategoryDTO } from "@/lib/types";
import { api } from "@/lib/api";

export default function CategoriesPage() {
  const [cats, setCats] = useState<CategoryDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    api<{ categories: CategoryDTO[] }>("/api/categories")
      .then((res) => alive && setCats(res.categories))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="pb-28">
      <PageHeader title="الأقسام" subtitle="تصفح الدليل حسب نوع الخدمة" />
      <div className="stagger px-4">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="mb-3 h-20 animate-pulse rounded-2xl bg-mist" />
          ))
        ) : cats.length === 0 ? (
          <EmptyState icon={FolderOpen} title="لا توجد أقسام بعد" />
        ) : (
          cats.map((c) => (
            <Link
              key={c.id}
              href={`/category/${c.id}`}
              className="mb-3 flex items-center gap-3 rounded-2xl border border-mist bg-white p-4 shadow-card transition hover:border-brand-300 hover:shadow-float/30 active:scale-[0.98]"
            >
              <CategoryIcon iconKey={c.iconKey} seed={c.id} className="size-13" />
              <div className="flex-1">
                <h3 className="font-display text-base font-extrabold text-brand-900">{c.name}</h3>
                <p className="text-xs font-bold text-ink/50">{c.count ?? 0} خدمة معتمدة</p>
              </div>
              <ChevronLeft className="size-5 text-ink/30" />
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
