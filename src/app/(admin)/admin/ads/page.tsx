"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Eye, Megaphone, Trash2, X } from "lucide-react";
import { Modal } from "@/components/Modal";
import { Field, TextArea } from "@/components/Field";
import { EmptyState } from "@/components/EmptyState";
import { useToast } from "@/components/Toast";
import { STATUS_META, type RequestStatus } from "@/lib/constants";
import type { AdDTO } from "@/lib/types";
import { api } from "@/lib/api";
import { cn, formatDate } from "@/lib/utils";

const TABS: { key: RequestStatus | "all"; label: string }[] = [
  { key: "pending", label: "بانتظار الموافقة" },
  { key: "approved", label: "منشورة" },
  { key: "rejected", label: "مرفوضة" },
  { key: "all", label: "الكل" },
];

export default function AdminAdsPage() {
  const { toast } = useToast();
  const [tab, setTab] = useState<RequestStatus | "all">("pending");
  const [items, setItems] = useState<AdDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejecting, setRejecting] = useState<AdDTO | null>(null);
  const [reason, setReason] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api<{ ads: AdDTO[] }>(
        `/api/admin/ads${tab === "all" ? "" : `?status=${tab}`}`
      );
      setItems(res.ads);
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    load();
  }, [load]);

  async function approve(a: AdDTO) {
    setBusyId(a.id);
    try {
      await api(`/api/admin/ads/${a.id}/approve`, { method: "POST" });
      toast("تم نشر الإعلان في الماركيو 🎉");
      await load();
    } catch (err) {
      toast(err instanceof Error ? err.message : "تعذر الاعتماد", "error");
    } finally {
      setBusyId(null);
    }
  }

  async function reject() {
    if (!rejecting) return;
    setBusyId(rejecting.id);
    try {
      await api(`/api/admin/ads/${rejecting.id}/reject`, {
        method: "POST",
        json: { reason },
      });
      toast("تم رفض الإعلان وإخطار صاحبه", "info");
      setRejecting(null);
      setReason("");
      await load();
    } catch (err) {
      toast(err instanceof Error ? err.message : "تعذر الرفض", "error");
    } finally {
      setBusyId(null);
    }
  }

  async function remove(a: AdDTO) {
    if (!confirm("حذف هذا الإعلان نهائيًا؟")) return;
    setBusyId(a.id);
    try {
      await api(`/api/admin/ads/${a.id}`, { method: "DELETE" });
      toast("تم حذف الإعلان", "info");
      await load();
    } catch {
      toast("تعذر الحذف", "error");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-brand-900">إعلانات الماركيو</h1>
        <p className="mt-1 text-sm font-bold text-ink/50">
          مساحة إعلانية بمبلغ بسيط — وافق على الطلبات لتنشر في الشريط الإعلاني بالرئيسية
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-xs font-extrabold transition",
              tab === t.key
                ? "bg-brand-700 text-white"
                : "bg-white text-ink/60 shadow-card hover:bg-brand-50"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-mist" />
          ))
        ) : items.length === 0 ? (
          <EmptyState icon={Megaphone} title="لا توجد إعلانات في هذا القسم" />
        ) : (
          items.map((a) => {
            const meta = STATUS_META[a.status];
            return (
              <article
                key={a.id}
                className="animate-fade-up rounded-2xl border border-mist bg-white p-4 shadow-card"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-extrabold",
                          meta.badge
                        )}
                      >
                        <span className={cn("size-1.5 rounded-full", meta.dot)} />
                        {meta.label}
                      </span>
                      <span className="rounded-full bg-brand-50 px-2.5 py-1 text-[10px] font-extrabold text-brand-700">
                        10 ج / شهر
                      </span>
                    </div>
                    <p className="mt-2 text-sm font-extrabold leading-relaxed text-brand-900">
                      «{a.text}»
                    </p>
                    <p className="mt-1 text-xs font-bold text-ink/55">
                      {a.ownerName} • <span dir="ltr">{a.phone}</span>
                    </p>
                    <p className="mt-1 text-[11px] font-bold text-ink/40">
                      مقدم الطلب: {a.userName} — {formatDate(a.createdAt)}
                    </p>
                  </div>
                </div>

                {a.status === "rejected" && a.rejectionReason && (
                  <p className="mt-3 rounded-xl bg-danger-soft p-2.5 text-xs font-bold text-danger">
                    سبب الرفض: {a.rejectionReason}
                  </p>
                )}

                <div className="mt-3 flex flex-wrap gap-2">
                  {a.status === "pending" && (
                    <>
                      <button
                        onClick={() => approve(a)}
                        disabled={busyId === a.id}
                        className="inline-flex h-9 items-center gap-1 rounded-xl bg-success px-3 text-xs font-extrabold text-white transition hover:brightness-105 active:scale-95 disabled:opacity-50"
                      >
                        <Check className="size-4" /> موافقة ونشر
                      </button>
                      <button
                        onClick={() => {
                          setRejecting(a);
                          setReason("");
                        }}
                        disabled={busyId === a.id}
                        className="inline-flex h-9 items-center gap-1 rounded-xl bg-danger px-3 text-xs font-extrabold text-white transition hover:brightness-105 active:scale-95 disabled:opacity-50"
                      >
                        <X className="size-4" /> رفض
                      </button>
                    </>
                  )}
                  {a.status !== "pending" && (
                    <button
                      onClick={() => remove(a)}
                      disabled={busyId === a.id}
                      className="inline-flex h-9 items-center gap-1 rounded-xl bg-danger-soft px-3 text-xs font-extrabold text-danger transition hover:brightness-95 active:scale-95 disabled:opacity-50"
                    >
                      <Trash2 className="size-4" /> حذف الإعلان
                    </button>
                  )}
                </div>
              </article>
            );
          })
        )}
      </div>

      {/* نافذة الرفض */}
      <Modal
        open={rejecting !== null}
        onClose={() => setRejecting(null)}
        title="رفض الإعلان"
      >
        <div className="space-y-4">
          <Field label="سبب الرفض" hint="يصل إلى صاحب الإعلان">
            <TextArea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="مثال: النص يحتوي على مبالغة في الادعاءات"
            />
          </Field>
          <button
            onClick={reject}
            disabled={busyId !== null}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-danger text-base font-extrabold text-white transition hover:brightness-105 active:scale-[0.98] disabled:opacity-50"
          >
            <X className="size-5" />
            تأكيد الرفض
          </button>
        </div>
      </Modal>
    </div>
  );
}
