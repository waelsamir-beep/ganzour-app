"use client";

import { useEffect, useState } from "react";
import { BellOff, CheckCheck, Info, PartyPopper, ShieldQuestion } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import type { NotificationDTO } from "@/lib/types";
import { api } from "@/lib/api";
import { cn, timeAgo } from "@/lib/utils";

const KIND_ICON: Record<string, typeof Info> = {
  info: Info,
  request: ShieldQuestion,
  success: PartyPopper,
};

export default function NotificationsPage() {
  const [items, setItems] = useState<NotificationDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    api<{ notifications: NotificationDTO[] }>("/api/notifications")
      .then((res) => {
        if (!alive) return;
        setItems(res.notifications);
        if (res.notifications.some((n) => !n.read)) {
          api("/api/notifications/read-all", { method: "POST" }).catch(() => {});
        }
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="pb-28">
      <PageHeader
        title="الإشعارات 🔔"
        subtitle="آخر التحديثات والردود على طلباتك"
        right={
          items.some((n) => !n.read) ? (
            <button
              onClick={() => setItems((prev) => prev.map((n) => ({ ...n, read: true })))}
              className="inline-flex items-center gap-1 rounded-xl bg-brand-50 px-3 py-2 text-[11px] font-extrabold text-brand-700 transition hover:bg-brand-100 active:scale-95"
            >
              <CheckCheck className="size-4" />
              قراءة الكل
            </button>
          ) : undefined
        }
      />
      <div className="space-y-2.5 px-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-mist" />
          ))
        ) : items.length === 0 ? (
          <EmptyState icon={BellOff} title="لا توجد إشعارات بعد" />
        ) : (
          items.map((n) => {
            const Icon = KIND_ICON[n.kind] ?? Info;
            return (
              <article
                key={n.id}
                className={cn(
                  "animate-fade-up flex items-start gap-3 rounded-2xl border p-4 shadow-card",
                  n.read ? "border-mist bg-white" : "border-brand-200 bg-brand-50"
                )}
              >
                <span
                  className={cn(
                    "grid size-10 shrink-0 place-items-center rounded-xl",
                    n.read ? "bg-paper text-ink/40" : "bg-brand-100 text-brand-700"
                  )}
                >
                  <Icon className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-extrabold text-brand-900">{n.title}</h3>
                    {!n.read && <span className="size-2 shrink-0 rounded-full bg-brand-500" />}
                  </div>
                  <p className="mt-0.5 text-xs font-medium leading-relaxed text-ink/60">{n.body}</p>
                  <p className="mt-1.5 text-[10px] font-bold text-ink/35">{timeAgo(n.createdAt)}</p>
                </div>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
