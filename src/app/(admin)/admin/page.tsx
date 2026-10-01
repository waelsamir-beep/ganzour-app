"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ClipboardCheck,
  HeartPulse,
  Megaphone,
  Store,
  UsersRound,
  Wrench,
  ChevronLeft,
} from "lucide-react";
import type { RequestDTO } from "@/lib/types";
import { api } from "@/lib/api";
import { formatNumber, formatDate } from "@/lib/utils";

type Stats = {
  members: number;
  professions: number;
  pending: number;
  medical: number;
  businesses: number;
  pendingAds: number;
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [requests, setRequests] = useState<RequestDTO[]>([]);

  useEffect(() => {
    let alive = true;
    Promise.all([
      api<Stats>("/api/admin/stats"),
      api<{ requests: RequestDTO[] }>("/api/admin/requests?status=pending"),
    ]).then(([s, r]) => {
      if (!alive) return;
      setStats(s);
      setRequests(r.requests.slice(0, 4));
    });
    return () => {
      alive = false;
    };
  }, []);

  const CARDS = stats
    ? [
        { label: "👥 إجمالي الأعضاء", value: stats.members, icon: UsersRound, tone: "bg-sea-100 text-sea-600" },
        { label: "👨‍🔧 إجمالي المهن", value: stats.professions, icon: Wrench, tone: "bg-brand-100 text-brand-700" },
        { label: "⏳ طلبات قيد المراجعة", value: stats.pending, icon: ClipboardCheck, tone: "bg-warning-soft text-warning", alert: stats.pending > 0 },
        { label: "🩺 الأطباء والعيادات", value: stats.medical, icon: HeartPulse, tone: "bg-emerald-100 text-emerald-700" },
        { label: "🏪 الأنشطة والخدمات", value: stats.businesses, icon: Store, tone: "bg-violet-100 text-violet-600" },
        { label: "📢 إعلانات بانتظار الموافقة", value: stats.pendingAds, icon: Megaphone, tone: "bg-amber-100 text-amber-700", alert: stats.pendingAds > 0 },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-brand-900">لوحة التحكم</h1>
        <p className="mt-1 text-sm font-bold text-ink/50">
          نظرة عامة على الدليل المهني لقرية جنزور
        </p>
      </div>

      {/* الإحصائيات */}
      <div className="stagger grid grid-cols-2 gap-3 lg:grid-cols-6">
        {stats === null
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-2xl bg-mist" />
            ))
          : CARDS.map((c) => (
              <div
                key={c.label}
                className="relative rounded-2xl border border-mist bg-white p-4 shadow-card"
              >
                {c.alert && (
                  <span className="animate-pulse-dot absolute left-3 top-3 size-2.5 rounded-full bg-danger" />
                )}
                <span className={`grid size-10 place-items-center rounded-xl ${c.tone}`}>
                  <c.icon className="size-5" />
                </span>
                <p className="mt-3 font-display text-2xl font-extrabold text-brand-900">
                  {formatNumber(c.value)}
                </p>
                <p className="text-[11px] font-extrabold text-ink/50">{c.label}</p>
              </div>
            ))}
      </div>

      {/* أحدث الطلبات */}
      <section className="rounded-3xl border border-mist bg-white p-5 shadow-card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-extrabold text-brand-900">
            أحدث طلبات المراجعة
          </h2>
          <Link
            href="/admin/requests"
            className="inline-flex items-center gap-1 text-xs font-extrabold text-brand-600 hover:text-brand-800"
          >
            عرض الكل <ChevronLeft className="size-4" />
          </Link>
        </div>
        {requests.length === 0 ? (
          <p className="rounded-xl bg-paper p-4 text-center text-sm font-bold text-ink/50">
            🎉 لا توجد طلبات بانتظار المراجعة حاليًا
          </p>
        ) : (
          <div className="space-y-2">
            {requests.map((r) => (
              <Link
                key={r.id}
                href="/admin/requests"
                className="flex items-center gap-3 rounded-2xl border border-mist p-3 transition hover:border-brand-300 hover:bg-brand-50/50"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-warning-soft text-warning">
                  <ClipboardCheck className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-extrabold text-brand-900">{r.title}</p>
                  <p className="truncate text-xs font-bold text-ink/50">
                    {r.ownerName} • {r.categoryName}
                  </p>
                </div>
                <span className="shrink-0 text-[11px] font-bold text-ink/40">
                  {formatDate(r.createdAt)}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
