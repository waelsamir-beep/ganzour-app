"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, UserCheck, UserRound, UserX, UsersRound } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { useToast } from "@/components/Toast";
import type { MemberAdminDTO } from "@/lib/types";
import { api } from "@/lib/api";
import { cn, formatDate } from "@/lib/utils";

export default function AdminMembersPage() {
  const { toast } = useToast();
  const [items, setItems] = useState<MemberAdminDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    api<{ members: MemberAdminDTO[] }>("/api/admin/members")
      .then((res) => alive && setItems(res.members))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  async function toggleStatus(m: MemberAdminDTO) {
    try {
      const res = await api<{ status: string }>(`/api/admin/members/${m.id}/toggle-status`, {
        method: "POST",
      });
      setItems((prev) => prev.map((x) => (x.id === m.id ? { ...x, status: res.status } : x)));
      toast(res.status === "active" ? "تم تفعيل الحساب" : "تم إيقاف الحساب مؤقتًا", "info");
    } catch (err) {
      toast(err instanceof Error ? err.message : "تعذر التنفيذ", "error");
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-brand-900">الأعضاء</h1>
        <p className="mt-1 text-sm font-bold text-ink/50">
          {items.length > 0 ? `${items.length} عضوًا مسجلًا في التطبيق` : "إدارة حسابات الأعضاء"}
        </p>
      </div>

      <div className="space-y-2.5">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-mist" />
          ))
        ) : items.length === 0 ? (
          <EmptyState icon={UsersRound} title="لا يوجد أعضاء بعد" />
        ) : (
          items.map((m) => (
            <article
              key={m.id}
              className="animate-fade-up flex flex-wrap items-center gap-3 rounded-2xl border border-mist bg-white p-4 shadow-card"
            >
              <span
                className={cn(
                  "grid size-11 shrink-0 place-items-center rounded-xl text-white",
                  m.role === "admin" ? "bg-brand-900" : "bg-brand-500"
                )}
              >
                {m.role === "admin" ? (
                  <ShieldCheck className="size-5" />
                ) : (
                  <UserRound className="size-5" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-extrabold text-brand-900">{m.name}</h3>
                  {m.role === "admin" ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-extrabold text-brand-700">
                      <ShieldCheck className="size-3" /> الإدارة
                    </span>
                  ) : (
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-extrabold",
                        m.status === "active"
                          ? "bg-success-soft text-success"
                          : "bg-danger-soft text-danger"
                      )}
                    >
                      {m.status === "active" ? "نشط" : "موقوف"}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs font-bold text-ink/50" dir="ltr">
                  {m.phone}
                </p>
                <p className="text-[11px] font-bold text-ink/40">
                  انضم في {formatDate(m.createdAt)} • {m.requestsCount} طلب إضافة مهنة
                </p>
              </div>
              {m.role !== "admin" && (
                <button
                  onClick={() => toggleStatus(m)}
                  className={cn(
                    "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl px-3 text-xs font-extrabold transition active:scale-95",
                    m.status === "active"
                      ? "bg-danger-soft text-danger hover:brightness-95"
                      : "bg-success-soft text-success hover:brightness-95"
                  )}
                >
                  {m.status === "active" ? (
                    <>
                      <UserX className="size-4" /> إيقاف الحساب
                    </>
                  ) : (
                    <>
                      <UserCheck className="size-4" /> تفعيل الحساب
                    </>
                  )}
                </button>
              )}
            </article>
          ))
        )}
      </div>
    </div>
  );
}
