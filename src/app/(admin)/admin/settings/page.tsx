"use client";

import { useState, type FormEvent } from "react";
import { Eye, EyeOff, KeyRound, ShieldCheck } from "lucide-react";
import { Field, PrimaryButton, TextInput } from "@/components/Field";
import { useToast } from "@/components/Toast";
import { api } from "@/lib/api";

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (form.next !== form.confirm) {
      toast("كلمتا المرور غير متطابقتين", "error");
      return;
    }
    setSaving(true);
    try {
      await api("/api/admin/change-password", { method: "POST", json: form });
      toast("تم تغيير كلمة المرور بنجاح ✅");
      setForm({ current: "", next: "", confirm: "" });
    } catch (err) {
      toast(err instanceof Error ? err.message : "تعذر التغيير", "error");
    } finally {
      setSaving(false);
    }
  }

  const type = show ? "text" : "password";

  return (
    <div className="max-w-xl space-y-5">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-brand-900">الإعدادات والأمان</h1>
        <p className="mt-1 text-sm font-bold text-ink/50">إدارة أمان حساب الإدارة</p>
      </div>

      <form
        onSubmit={onSubmit}
        className="space-y-4 rounded-3xl border border-mist bg-white p-6 shadow-card"
      >
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-brand-100 text-brand-700">
            <KeyRound className="size-5" />
          </span>
          <div>
            <h2 className="font-display text-base font-extrabold text-brand-900">
              تغيير كلمة المرور
            </h2>
            <p className="text-xs font-bold text-ink/50">
              كلمة المرور مخزنة مشفرة بالكامل ولا يمكن لأي أحد الاطلاع عليها
            </p>
          </div>
        </div>
        <Field label="كلمة المرور الحالية" required>
          <TextInput
            type={type}
            value={form.current}
            onChange={(e) => setForm((f) => ({ ...f, current: e.target.value }))}
            autoComplete="current-password"
            required
          />
        </Field>
        <Field label="كلمة المرور الجديدة" required>
          <TextInput
            type={type}
            value={form.next}
            onChange={(e) => setForm((f) => ({ ...f, next: e.target.value }))}
            autoComplete="new-password"
            minLength={6}
            required
          />
        </Field>
        <Field label="تأكيد كلمة المرور الجديدة" required>
          <TextInput
            type={type}
            value={form.confirm}
            onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))}
            autoComplete="new-password"
            minLength={6}
            required
          />
        </Field>
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="inline-flex items-center gap-1.5 text-xs font-extrabold text-brand-600 hover:text-brand-800"
          >
            {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            {show ? "إخفاء كلمات المرور" : "إظهار كلمات المرور"}
          </button>
          <PrimaryButton type="submit" loading={saving} className="w-auto px-8">
            حفظ
          </PrimaryButton>
        </div>
      </form>

      <div className="rounded-3xl border border-mist bg-white p-6 shadow-card">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-success-soft text-success">
            <ShieldCheck className="size-5" />
          </span>
          <div>
            <h2 className="font-display text-base font-extrabold text-brand-900">صلاحيات الإدارة</h2>
            <p className="text-xs font-bold leading-relaxed text-ink/50">
              حسابك يملك صلاحيات الإدارة الكاملة: مراجعة الطلبات، إدارة المهن والأعضاء والأقسام،
              والتحكم الكامل في محتوى الدليل. الأعضاء العاديون لا يمكنهم الوصول إلى هذه اللوحة أو
              نشر أي محتوى دون موافقتك.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
