"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, ClipboardCheck, Eye, X } from "lucide-react";
import { Modal } from "@/components/Modal";
import { Field, TextArea } from "@/components/Field";
import { EmptyState } from "@/components/EmptyState";
import { useToast } from "@/components/Toast";
import { STATUS_META, type RequestStatus } from "@/lib/constants";
import type { RequestDTO } from "@/lib/types";
import { api } from "@/lib/api";
import { cn, formatDate } from "@/lib/utils";

const TABS: { key: RequestStatus | "all"; label: string }[] = [
  { key: "pending", label: "قيد المراجعة" },
  { key: "approved", label: "المعتمدة" },
  { key: "rejected", label: "المرفوضة" },
  { key: "all", label: "الكل" },
];

export default function AdminRequestsPage() {
  const { toast } = useToast();
  const [tab, setTab] = useState<RequestStatus | "all">("pending");
  const [items, setItems] = useState<RequestDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState<RequestDTO | null>(null);
  const [rejecting, setRejecting] = useState<RequestDTO | null>(null);
  const [reason, setReason] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api<{ requests: RequestDTO[] }>(
        `/api/admin/requests${tab === "all" ? "" : `?status=${tab}`}`
      );
      setItems(res.requests);
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    load();
  }, [load]);

  async function approve(r: RequestDTO) {
    setBusyId(r.id);
    try {
      await api(`/api/admin/requests/${r.id}/approve`, { method: "POST" });
      toast(`تم اعتماد «${r.title}» ونشرها في الدليل 🎉`);
      setViewing(null);
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
      await api(`/api/admin/requests/${rejecting.id}/reject`, {
        method: "POST",
        json: { reason },
      });
      toast("تم رفض الطلب وإخطار العضو", "info");
      setRejecting(null);
      setReason("");
      setViewing(null);
      await load();
    } catch (err) {
      toast(err instanceof Error ? err.message : "تعذر الرفض", "error");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-brand-900">
          طلبات إضافة المهن
        </h1>
        <p className="mt-1 text-sm font-bold text-ink/50">
          لا تُنشر أي مهنة في الدليل إلا بعد موافقتك عليها
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-xs font-extrabold transition",
              tab === t.key ? "bg-brand-700 text-white" : "bg-white text-ink/60 shadow-card hover:bg-brand-50"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-mist" />
          ))
        ) : items.length === 0 ? (
          <EmptyState icon={ClipboardCheck} title="لا توجد طلبات في هذا القسم" />
        ) : (
          items.map((r) => {
            const meta = STATUS_META[r.status];
            return (
              <article
                key={r.id}
                className="animate-fade-up rounded-2xl border border-mist bg-white p-4 shadow-card"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display text-base font-extrabold text-brand-900">
                        {r.title}
                      </h3>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-extrabold",
                          meta.badge
                        )}
                      >
                        <span className={cn("size-1.5 rounded-full", meta.dot)} />
                        {meta.label}
                      </span>
                    </div>
                    <p className="mt-1 text-xs font-bold text-ink/55">
                      {r.ownerName} • {r.categoryName} •{" "}
                      <span dir="ltr">{r.phone}</span>
                    </p>
                    {r.address && (
                      <p className="mt-0.5 text-xs font-medium text-ink/45">📍 {r.address}</p>
                    )}
                    <p className="mt-1.5 text-[11px] font-bold text-ink/40">
                      مقدم الطلب: {r.userName} (<span dir="ltr">{r.userPhone}</span>) —{" "}
                      {formatDate(r.createdAt)}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <button
                      onClick={() => setViewing(r)}
                      className="inline-flex h-9 items-center gap-1 rounded-xl bg-paper px-3 text-xs font-extrabold text-ink/70 transition hover:bg-mist active:scale-95"
                    >
                      <Eye className="size-4" /> عرض التفاصيل
                    </button>
                    {r.status === "pending" && (
                      <>
                        <button
                          onClick={() => approve(r)}
                          disabled={busyId === r.id}
                          className="inline-flex h-9 items-center gap-1 rounded-xl bg-success px-3 text-xs font-extrabold text-white transition hover:brightness-105 active:scale-95 disabled:opacity-50"
                        >
                          <Check className="size-4" /> موافقة
                        </button>
                        <button
                          onClick={() => {
                            setRejecting(r);
                            setReason("");
                          }}
                          disabled={busyId === r.id}
                          className="inline-flex h-9 items-center gap-1 rounded-xl bg-danger px-3 text-xs font-extrabold text-white transition hover:brightness-105 active:scale-95 disabled:opacity-50"
                        >
                          <X className="size-4" /> رفض
                        </button>
                      </>
                    )}
                  </div>
                </div>
                {r.status === "rejected" && r.rejectionReason && (
                  <p className="mt-3 rounded-xl bg-danger-soft p-2.5 text-xs font-bold text-danger">
                    سبب الرفض: {r.rejectionReason}
                  </p>
                )}
              </article>
            );
          })
        )}
      </div>

      {/* نافذة التفاصيل */}
      <Modal
        open={viewing !== null}
        onClose={() => setViewing(null)}
        title="تفاصيل الطلب"
        wide
      >
        {viewing && (
          <div className="space-y-3 text-sm">
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ["اسم صاحب المهنة", viewing.ownerName],
                ["المهنة / النشاط", viewing.title],
                ["القسم", viewing.categoryName],
                ["رقم الهاتف", viewing.phone],
                ["واتساب", viewing.whatsapp ?? "—"],
                ["العنوان", viewing.address ?? "—"],
                ["مواعيد العمل", viewing.workingHours ?? "—"],
                ["مقدم الطلب", `${viewing.userName} — ${viewing.userPhone}`],
                ["تاريخ الطلب", formatDate(viewing.createdAt)],
              ].map(([k, v]) => (
                <div key={k} className="rounded-xl bg-paper p-3">
                  <p className="text-[11px] font-extrabold text-ink/45">{k}</p>
                  <p className="mt-0.5 font-bold text-ink/80">{v}</p>
                </div>
              ))}
            </div>
            {viewing.description && (
              <div className="rounded-xl bg-paper p-3">
                <p className="text-[11px] font-extrabold text-ink/45">وصف الخدمة</p>
                <p className="mt-0.5 font-bold leading-relaxed text-ink/80">
                  {viewing.description}
                </p>
              </div>
            )}
            {viewing.status === "pending" && (
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => approve(viewing)}
                  disabled={busyId === viewing.id}
                  className="inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl bg-success text-sm font-extrabold text-white transition hover:brightness-105 active:scale-95 disabled:opacity-50"
                >
                  <Check className="size-4.5" /> موافقة ونشر
                </button>
                <button
                  onClick={() => {
                    setRejecting(viewing);
                    setReason("");
                  }}
                  disabled={busyId === viewing.id}
                  className="inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl bg-danger text-sm font-extrabold text-white transition hover:brightness-105 active:scale-95 disabled:opacity-50"
                >
                  <X className="size-4.5" /> رفض
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* نافذة الرفض */}
      <Modal
        open={rejecting !== null}
        onClose={() => setRejecting(null)}
        title={`رفض طلب «${rejecting?.title ?? ""}»`}
      >
        <div className="space-y-4">
          <Field label="سبب الرفض" hint="يصل إلى العضو في الإشعارات">
            <TextArea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="مثال: رقم الهاتف غير صحيح، يرجى التحديث وإعادة الإرسال"
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
