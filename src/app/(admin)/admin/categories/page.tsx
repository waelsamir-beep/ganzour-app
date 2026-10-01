"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Eye, EyeOff, Pencil, Plus, FolderKanban } from "lucide-react";
import { CategoryIcon } from "@/components/CategoryIcon";
import { Modal } from "@/components/Modal";
import { Field, Select, TextInput } from "@/components/Field";
import { useToast } from "@/components/Toast";
import { CATEGORY_ICONS, CATEGORY_ICON_LABELS } from "@/lib/constants";
import type { CategoryDTO } from "@/lib/types";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function AdminCategoriesPage() {
  const { toast } = useToast();
  const [items, setItems] = useState<CategoryDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<CategoryDTO | null>(null);
  const [name, setName] = useState("");
  const [iconKey, setIconKey] = useState<string>("folder");
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await api<{ categories: CategoryDTO[] }>("/api/admin/categories");
      setItems(res.categories);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function addCategory(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await api("/api/admin/categories", { method: "POST", json: { name, iconKey } });
      toast("تمت إضافة القسم بنجاح ✅");
      setAddOpen(false);
      setName("");
      setIconKey("folder");
      await load();
    } catch (err) {
      toast(err instanceof Error ? err.message : "تعذر الإضافة", "error");
    } finally {
      setSaving(false);
    }
  }

  async function saveEdit() {
    if (!editing) return;
    setSaving(true);
    try {
      await api(`/api/admin/categories/${editing.id}`, {
        method: "PUT",
        json: { name, iconKey },
      });
      toast("تم حفظ التعديلات ✅");
      setEditing(null);
      await load();
    } catch (err) {
      toast(err instanceof Error ? err.message : "تعذر الحفظ", "error");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(c: CategoryDTO) {
    try {
      await api(`/api/admin/categories/${c.id}`, {
        method: "PUT",
        json: { isActive: !c.isActive },
      });
      toast(c.isActive ? "تم إخفاء القسم من التطبيق" : "تم تفعيل القسم", "info");
      await load();
    } catch {
      toast("تعذر التنفيذ", "error");
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-brand-900">الأقسام</h1>
          <p className="mt-1 text-sm font-bold text-ink/50">
            تنظيم الدليل — يمكنك إضافة أقسام جديدة مستقبلًا
          </p>
        </div>
        <button
          onClick={() => {
            setName("");
            setIconKey("folder");
            setAddOpen(true);
          }}
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-brand-700 px-4 text-sm font-extrabold text-white transition hover:bg-brand-800 active:scale-95"
        >
          <Plus className="size-4.5" /> قسم جديد
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-2xl bg-mist" />
            ))
          : items.map((c) => (
              <article
                key={c.id}
                className={cn(
                  "animate-fade-up flex items-center gap-3 rounded-2xl border bg-white p-4 shadow-card",
                  c.isActive ? "border-mist" : "border-danger/30 opacity-80"
                )}
              >
                <CategoryIcon iconKey={c.iconKey} seed={c.id} className="size-12" />
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-extrabold text-brand-900">{c.name}</h3>
                  <p className="text-xs font-bold text-ink/50">
                    {c.count} خدمة {c.isActive ? "" : "• مخفي"}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1.5">
                  <button
                    onClick={() => {
                      setEditing(c);
                      setName(c.name);
                      setIconKey(c.iconKey);
                    }}
                    className="grid size-9 place-items-center rounded-xl bg-brand-50 text-brand-700 transition hover:bg-brand-100 active:scale-95"
                    aria-label="تعديل"
                  >
                    <Pencil className="size-4" />
                  </button>
                  <button
                    onClick={() => toggleActive(c)}
                    className={cn(
                      "grid size-9 place-items-center rounded-xl transition active:scale-95",
                      c.isActive
                        ? "bg-warning-soft text-warning hover:brightness-95"
                        : "bg-success-soft text-success hover:brightness-95"
                    )}
                    aria-label={c.isActive ? "إخفاء" : "تفعيل"}
                  >
                    {c.isActive ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </article>
            ))}
      </div>

      {!loading && items.length === 0 && (
        <div className="rounded-2xl bg-white p-8 text-center text-sm font-bold text-ink/50 shadow-card">
          <FolderKanban className="mx-auto mb-2 size-8 text-ink/30" />
          لا توجد أقسام — أضف أول قسم الآن
        </div>
      )}

      {/* إضافة / تعديل قسم */}
      <Modal
        open={addOpen || editing !== null}
        onClose={() => {
          setAddOpen(false);
          setEditing(null);
        }}
        title={editing ? `تعديل قسم «${editing.name}»` : "إضافة قسم جديد"}
      >
        <form onSubmit={editing ? undefined : addCategory} className="space-y-4">
          <Field label="اسم القسم" required>
            <TextInput
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: التعليم والدروس"
              required
              minLength={2}
            />
          </Field>
          <Field label="الأيقونة">
            <Select value={iconKey} onChange={(e) => setIconKey(e.target.value)}>
              {CATEGORY_ICONS.map((k) => (
                <option key={k} value={k}>
                  {CATEGORY_ICON_LABELS[k]}
                </option>
              ))}
            </Select>
          </Field>
          <div className="flex items-center gap-3 rounded-xl bg-paper p-3">
            <CategoryIcon iconKey={iconKey} seed={3} className="size-12" />
            <p className="text-xs font-bold text-ink/50">معاينة شكل القسم في التطبيق</p>
          </div>
          <button
            type={editing ? "button" : "submit"}
            onClick={editing ? saveEdit : undefined}
            disabled={saving}
            className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-brand-700 text-base font-extrabold text-white transition hover:bg-brand-800 active:scale-[0.98] disabled:opacity-50"
          >
            {editing ? "حفظ التعديلات" : "إضافة القسم"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
