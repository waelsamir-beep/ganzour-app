"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { CheckCircle2, SendHorizonal } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Field, PrimaryButton, Select, TextArea, TextInput } from "@/components/Field";
import { useToast } from "@/components/Toast";
import type { CategoryDTO } from "@/lib/types";
import { api } from "@/lib/api";

const EMPTY = {
  ownerName: "",
  title: "",
  categoryId: "",
  phone: "",
  whatsapp: "",
  address: "",
  description: "",
  workingHours: "",
  mapUrl: "",
};

export default function AddProfessionPage() {
  const { toast } = useToast();
  const [cats, setCats] = useState<CategoryDTO[]>([]);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    let alive = true;
    api<{ categories: CategoryDTO[] }>("/api/categories").then((res) => {
      if (alive) setCats(res.categories);
    });
    return () => {
      alive = false;
    };
  }, []);

  const set =
    (k: keyof typeof EMPTY) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await api("/api/requests", { method: "POST", json: form });
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      toast(err instanceof Error ? err.message : "تعذر إرسال الطلب", "error");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="pb-28">
        <PageHeader back title="إضافة مهنة جديدة" />
        <div className="animate-fade-up mx-4 mt-8 flex flex-col items-center rounded-3xl border border-success/20 bg-white p-8 text-center shadow-card">
          <CheckCircle2 className="size-16 text-success" strokeWidth={1.6} />
          <h2 className="mt-4 font-display text-xl font-extrabold text-brand-900">
            تم إرسال طلبك بنجاح ✅
          </h2>
          <p className="mt-2 text-sm font-medium leading-relaxed text-ink/60">
            تم إرسال طلب إضافة المهنة إلى الإدارة، وسيتم مراجعة البيانات قبل نشرها في الدليل.
          </p>
          <div className="mt-6 flex w-full flex-col gap-2">
            <Link
              href="/my-requests"
              className="flex h-12 items-center justify-center rounded-xl bg-brand-700 text-sm font-extrabold text-white transition hover:bg-brand-800"
            >
              متابعة طلباتي
            </Link>
            <button
              onClick={() => {
                setForm(EMPTY);
                setSubmitted(false);
              }}
              className="flex h-12 items-center justify-center rounded-xl border border-mist bg-white text-sm font-extrabold text-brand-700 transition hover:bg-brand-50"
            >
              إرسال طلب آخر
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-28">
      <PageHeader back title="إضافة مهنة جديدة" subtitle="تُنشر البيانات بعد مراجعة الإدارة واعتمادها" />
      <form onSubmit={onSubmit} className="space-y-4 px-4">
        <div className="animate-fade-up rounded-2xl border border-sea-200 bg-sea-100/60 p-3.5 text-xs font-bold leading-relaxed text-sea-600">
          لن تظهر أي مهنة جديدة للعامة إلا بعد موافقة الإدارة عليها. ستصلك رسالة بحالة الطلب في
          شاشة الإشعارات.
        </div>

        <Field label="اسم صاحب المهنة" required>
          <TextInput
            placeholder="مثال: أسطى محمد عبدالله"
            value={form.ownerName}
            onChange={set("ownerName")}
            required
            minLength={3}
          />
        </Field>
        <Field label="اسم المهنة / النشاط" required>
          <TextInput
            placeholder="مثال: كهربائي منازل"
            value={form.title}
            onChange={set("title")}
            required
            minLength={2}
          />
        </Field>
        <Field label="القسم" required>
          <Select value={form.categoryId} onChange={set("categoryId")} required>
            <option value="" disabled>
              اختر القسم المناسب
            </option>
            {cats.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="رقم الهاتف" required>
          <TextInput
            type="tel"
            dir="ltr"
            className="text-left"
            placeholder="01XXXXXXXXX"
            value={form.phone}
            onChange={set("phone")}
            required
          />
        </Field>
        <Field label="رقم واتساب" hint="اختياري">
          <TextInput
            type="tel"
            dir="ltr"
            className="text-left"
            placeholder="01XXXXXXXXX"
            value={form.whatsapp}
            onChange={set("whatsapp")}
          />
        </Field>
        <Field label="العنوان">
          <TextInput
            placeholder="مثال: شارع السوق — جنزور"
            value={form.address}
            onChange={set("address")}
          />
        </Field>
        <Field label="وصف الخدمة">
          <TextArea
            placeholder="وصف مختصر للخدمات التي تقدمها..."
            value={form.description}
            onChange={set("description")}
          />
        </Field>
        <Field label="مواعيد العمل" hint="اختياري">
          <TextInput
            placeholder="مثال: يوميًا من 9 صباحًا حتى 8 مساءً"
            value={form.workingHours}
            onChange={set("workingHours")}
          />
        </Field>
        <Field label="الموقع على الخريطة" hint="اختياري">
          <TextInput
            type="url"
            dir="ltr"
            className="text-left"
            placeholder="https://maps.google.com/..."
            value={form.mapUrl}
            onChange={set("mapUrl")}
          />
        </Field>

        <PrimaryButton type="submit" loading={loading}>
          <SendHorizonal className="size-5" />
          تأكيد وإرسال الطلب
        </PrimaryButton>
      </form>
    </div>
  );
}
