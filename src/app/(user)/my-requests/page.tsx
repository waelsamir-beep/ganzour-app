"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ClipboardList, Plus } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { STATUS_META } from "@/lib/constants";
import type { RequestDTO } from "@/lib/types";
import { api } from "@/lib/api";
import { cn, formatDate } from "@/lib/utils";

export default function MyRequestsPage() {
  const [items, setItems] = useState<RequestDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    api<{ requests: RequestDTO[] }>("/api/my-requests")
      .then((res) => alive && setItems(res.requests))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="pb-28">
      <PageHeader title="طلباتي" subtitle="متابعة حالة طلبات إضافة المهن" />
      <div className="space-y-3 px-4">
        {loading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-mist" />
          ))
        ) : items.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="لم ترسل أي طلبات بعد"
            description="أضف مهنة أو خدمة جديدة إلى دليل القرية."
            action={
              <Link
                href="/add-profession"
                className="mt-2 inline-flex items-center gap-1.5 rounded-xl bg-brand-700 px-5 py-2.5 text-sm font-extrabold text-white transition hover:bg-brand-800"
              >
                <Plus className="size-4" /> إضافة مهنة
              </Link>
            }
          />
        ) : (
          items.map((r) => {
            const meta = STATUS_META[r.status];
            return (
              <article
                key={r.id}
                className="animate-fade-up rounded-2xl border border-mist bg-white p-4 shadow-card"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate font-display text-base font-extrabold text-brand-900">
                      {r.title}
                    </h3>
                    <p className="truncate text-xs font-bold text-ink/55">{r.ownerName}</p>
                    <p className="mt-1 text-[11px] font-bold text-ink/40">
                      {r.categoryName} • {formatDate(r.createdAt)}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-extrabold",
                      meta.badge
                    )}
                  >
                    <span className={cn("size-2 rounded-full", meta.dot)} />
                    {r.status === "pending" ? "🟡" : r.status === "approved" ? "🟢" : "🔴"}{" "}
                    {meta.label}
                  </span>
                </div>
                {r.status === "rejected" && r.rejectionReason && (
                  <p className="mt-3 rounded-xl bg-danger-soft p-3 text-xs font-bold leading-relaxed text-danger">
                    سبب الرفض: {r.rejectionReason}
                  </p>
                )}
                {r.status === "approved" && (
                  <p className="mt-3 rounded-xl bg-success-soft p-3 text-xs font-bold leading-relaxed text-success">
                    🎉 تم اعتماد المهنة وأصبحت ظاهرة الآن في الدليل لجميع الأعضاء.
                  </p>
                )}
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
