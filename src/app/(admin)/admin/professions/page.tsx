"use client";

import { useCallback, useEffect, useState } from "react";
import { EyeOff, Eye, Pencil, Search, Trash2, Wrench } from "lucide-react";
import { Modal } from "@/components/Modal";
import { Field, Select, TextArea, TextInput } from "@/components/Field";
import { EmptyState } from "@/components/EmptyState";
import { useToast } from "@/components/Toast";
import type { CategoryDTO, ProfessionDTO } from "@/lib/types";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function AdminProfessionsPage() {
  const { toast } = useToast();
  const [q, setQ] = useState("");
  const [items, setItems] = useState<ProfessionDTO[]>([]);
  const [cats, setCats] = useState<CategoryDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<ProfessionDTO | null>(null);
  const [deleting, setDeleting] = useState<ProfessionDTO | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api<{ professions: ProfessionDTO[] }>(
        `/api/admin/professions${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ""}`
      );
      setItems(res.professions);
    } finally {
      setLoading(false);
    }
  }, [q]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  useEffect(() => {
    api<{ categories: CategoryDTO[] }>("/api/admin/categories").then((res) =>
      setCats(res.categories)
    );
  }, []);

  function openEdit(p: ProfessionDTO) {
    setEditing(p);
    setForm({
      ownerName: p.ownerName,
      title: p.title,
      categoryId: String(p.categoryId),
      phone: p.phone,
      whatsapp: p.whatsapp ?? "",
      address: p.address ?? "",
      description: p.description ?? "",
      workingHours: p.workingHours ?? "",
      mapUrl: p.mapUrl ?? "",
      imageUrl: p.imageUrl ?? "",
    });
  }

  async function save() {
    if (!editing) return;
    setSaving(true);
    try {
      await api(`/api/admin/professions/${editing.id}`, { method: "PUT", json: form });
      toast("تم حفظ التعديلات بنجاح ✅");
      setEditing(null);
      await load();
    } catch (err) {
      toast(err instanceof Error ? err.message : "تعذر الحفظ", "error");
    } finally {
      setSaving(false);
    }
  }

  async function toggleHidden(p: ProfessionDTO) {
    const next = p.status === "hidden" ? "approved" : "hidden";
    try {
      await api(`/api/admin/professions/${p.id}`, { method: "PUT", json: { status: next } });
      toast(next === "hidden" ? "تم إخفاء المهنة" : "تمت إعادة تفعيل المهنة", "info");
      await load();
    } catch {
      toast("تعذر التنفيذ", "error");
    }
  }

  async function remove() {
    if (!deleting) return;
    setSaving(true);
    try {
      await api(`/api/admin/professions/${deleting.id}`, { method: "DELETE" });
      toast("تم حذف المهنة نهائيًا", "info");
      setDeleting(null);
      await load();
    } catch {
      toast("تعذر الحذف", "error");
    } finally {
      setSaving(false);
    }
  }

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-brand-900">إدارة المهن</h1>
        <p className="mt-1 text-sm font-bold text-ink/50">
          تعديل وإخفاء وحذف المهن والخدمات المعتمدة
        </p>
      </div>

      <div className="flex items-center gap-2 rounded-2xl border border-mist bg-white px-4 py-3 shadow-card focus-within:border-brand-400 focus-within:ring-4 focus-within:ring-brand-100">
        <Search className="size-5 shrink-0 text-brand-500" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="ابحث باسم المهنة أو الشخص أو القسم..."
          className="w-full bg-transparent text-sm font-bold outline-none placeholder:font-medium placeholder:text-ink/35"
        />
      </div>

      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-mist" />
          ))
        ) : items.length === 0 ? (
          <EmptyState icon={Wrench} title="لا توجد نتائج" />
        ) : (
          items.map((p) => (
            <article
              key={p.id}
              className={cn(
                "animate-fade-up rounded-2xl border bg-white p-4 shadow-card",
                p.status === "hidden" ? "border-danger/30" : "border-mist"
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-base font-extrabold text-brand-900">
                      {p.ownerName}
                    </h3>
                    {p.status === "hidden" ? (
                      <span className="rounded-full bg-danger-soft px-2.5 py-1 text-[10px] font-extrabold text-danger">
                        مخفية
                      </span>
                    ) : (
                      <span className="rounded-full bg-success-soft px-2.5 py-1 text-[10px] font-extrabold text-success">
                        معتمدة ومنشورة
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs font-bold text-ink/55">
                    {p.title} • {p.categoryName} • <span dir="ltr">{p.phone}</span>
                  </p>
                  {p.address && (
                    <p className="mt-0.5 text-[11px] font-medium text-ink/45">📍 {p.address}</p>
                  )}
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <button
                    onClick={() => openEdit(p)}
                    className="inline-flex h-9 items-center gap-1 rounded-xl bg-brand-50 px-3 text-xs font-extrabold text-brand-700 transition hover:bg-brand-100 active:scale-95"
                  >
                    <Pencil className="size-3.5" /> تعديل
                  </button>
                  <button
                    onClick={() => toggleHidden(p)}
                    className={cn(
                      "inline-flex h-9 items-center gap-1 rounded-xl px-3 text-xs font-extrabold transition active:scale-95",
                      p.status === "hidden"
                        ? "bg-success-soft text-success hover:brightness-95"
                        : "bg-warning-soft text-warning hover:brightness-95"
                    )}
                  >
                    {p.status === "hidden" ? (
                      <>
                        <Eye className="size-3.5" /> إعادة تفعيل
                      </>
                    ) : (
                      <>
                        <EyeOff className="size-3.5" /> إخفاء
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setDeleting(p)}
                    className="inline-flex h-9 items-center gap-1 rounded-xl bg-danger-soft px-3 text-xs font-extrabold text-danger transition hover:brightness-95 active:scale-95"
                  >
                    <Trash2 className="size-3.5" /> حذف
                  </button>
                </div>
              </div>
            </article>
          ))
        )}
      </div>

      {/* نافذة التعديل */}
      <Modal open={editing !== null} onClose={() => setEditing(null)} title={`تعديل: ${editing?.ownerName ?? ""}`} wide>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="اسم صاحب المهنة" required>
            <TextInput value={form.ownerName ?? ""} onChange={set("ownerName")} />
          </Field>
          <Field label="المهنة / التخصص" required>
            <TextInput value={form.title ?? ""} onChange={set("title")} />
          </Field>
          <Field label="القسم">
            <Select value={form.categoryId ?? ""} onChange={set("categoryId")}>
              {cats.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                  {c.isActive ? "" : " (مخفي)"}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="رقم الهاتف" required>
            <TextInput dir="ltr" className="text-left" value={form.phone ?? ""} onChange={set("phone")} />
          </Field>
          <Field label="رقم واتساب">
            <TextInput dir="ltr" className="text-left" value={form.whatsapp ?? ""} onChange={set("whatsapp")} />
          </Field>
          <Field label="العنوان">
            <TextInput value={form.address ?? ""} onChange={set("address")} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="وصف الخدمة">
              <TextArea value={form.description ?? ""} onChange={set("description")} />
            </Field>
          </div>
          <Field label="مواعيد العمل">
            <TextInput value={form.workingHours ?? ""} onChange={set("workingHours")} />
          </Field>
          <Field label="رابط الخريطة">
            <TextInput dir="ltr" className="text-left" value={form.mapUrl ?? ""} onChange={set("mapUrl")} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="رابط الصورة" hint="اختياري">
              <TextInput dir="ltr" className="text-left" value={form.imageUrl ?? ""} onChange={set("imageUrl")} />
            </Field>
          </div>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-xl bg-brand-700 text-base font-extrabold text-white transition hover:bg-brand-800 active:scale-[0.98] disabled:opacity-50"
        >
          حفظ التعديلات
        </button>
      </Modal>

      {/* تأكيد الحذف */}
      <Modal open={deleting !== null} onClose={() => setDeleting(null)} title="تأكيد الحذف">
        <p className="text-sm font-bold leading-relaxed text-ink/70">
          هل أنت متأكد من حذف «{deleting?.ownerName} — {deleting?.title}» نهائيًا؟ لا يمكن التراجع
          عن هذا الإجراء.
        </p>
        <div className="mt-5 flex gap-2">
          <button
            onClick={() => setDeleting(null)}
            className="h-12 flex-1 rounded-xl border border-mist bg-white text-sm font-extrabold text-ink/70 transition hover:bg-paper"
          >
            إلغاء
          </button>
          <button
            onClick={remove}
            disabled={saving}
            className="h-12 flex-1 rounded-xl bg-danger text-sm font-extrabold text-white transition hover:brightness-105 disabled:opacity-50"
          >
            حذف نهائي
          </button>
        </div>
      </Modal>
    </div>
  );
}
