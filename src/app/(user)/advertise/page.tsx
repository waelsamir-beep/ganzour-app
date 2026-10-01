"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Banknote, CheckCircle2, Megaphone, SendHorizonal } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Field, PrimaryButton, TextInput } from "@/components/Field";
import { useToast } from "@/components/Toast";
import { api } from "@/lib/api";

const EMPTY = { text: "", ownerName: "", phone: "", whatsapp: "" };

export default function AdvertisePage() {
  const { toast } = useToast();
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const set =
    (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await api("/api/ads/request", { method: "POST", json: form });
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
        <PageHeader back title="أعلن هنا" />
        <div className="animate-fade-up mx-4 mt-8 flex flex-col items-center rounded-3xl border border-success/20 bg-white p-8 text-center shadow-card">
          <CheckCircle2 className="size-16 text-success" strokeWidth={1.6} />
          <h2 className="mt-4 font-display text-xl font-extrabold text-brand-900">
            تم إرسال طلب الإعلان بنجاح ✅
          </h2>
          <p className="mt-2 text-sm font-medium leading-relaxed text-ink/60">
            سيتم مراجعة الإعلان من الإدارة، وبعد الموافقة سيظهر في الشريط الإعلاني بالصفحة
            الرئيسية لجميع الأهالي. ستصلك رسالة في الإشعارات فور الموافقة.
          </p>
          <div className="mt-6 flex w-full flex-col gap-2">
            <Link
              href="/home"
              className="flex h-12 items-center justify-center rounded-xl bg-brand-700 text-sm font-extrabold text-white transition hover:bg-brand-800"
            >
              العودة للرئيسية
            </Link>
            <button
              onClick={() => {
                setForm(EMPTY);
                setSubmitted(false);
              }}
              className="flex h-12 items-center justify-center rounded-xl border border-mist bg-white text-sm font-extrabold text-brand-700 transition hover:bg-brand-50"
            >
              إرسال إعلان آخر
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-28">
      <PageHeader back title="أعلن هنا 📢" subtitle="مساحة إعلانية بمبلغ بسيط تصل لكل أهل القرية" />
      <div className="space-y-4 px-4">
        {/* بطاقة السعر */}
        <section className="animate-fade-up overflow-hidden rounded-3xl bg-gradient-to-l from-brand-900 to-brand-700 p-5 text-white shadow-float">
          <div className="flex items-center gap-3">
            <span className="grid size-12 place-items-center rounded-2xl bg-amber-400 text-brand-950">
              <Banknote className="size-6" />
            </span>
            <div>
              <p className="font-display text-2xl font-extrabold">
                10 جنيهات <span className="text-sm font-bold text-brand-200">/ شهر</span>
              </p>
              <p className="text-xs font-bold text-brand-100">
                إعلانك يتحرك في الرئيسية أمام كل زوار الدليل
              </p>
            </div>
          </div>
          <ul className="mt-4 space-y-1.5 text-xs font-bold text-brand-100">
            <li>✔ يظهر في الشريط الإعلاني أعلى الصفحة الرئيسية</li>
            <li>✔ يُعرض مع رقم هاتفك للاتصال المباشر</li>
            <li>✔ يُنشر بعد موافقة الإدارة مباشرة</li>
            <li>✔ التحصيل يدويًا مع مندوب الدليل أو الوحدة المحلية</li>
          </ul>
        </section>

        <form onSubmit={onSubmit} className="space-y-4">
          <Field label="نص الإعلان" required hint="حتى 160 حرفًا">
            <TextInput
              placeholder="مثال: مخبز البركة — عيش بلدي طازج من 5 صباحًا"
              value={form.text}
              onChange={set("text")}
              required
              minLength={6}
              maxLength={160}
            />
          </Field>
          <Field label="اسم صاحب الإعلان / النشاط" required>
            <TextInput
              placeholder="مثال: مخبز البركة"
              value={form.ownerName}
              onChange={set("ownerName")}
              required
              minLength={3}
            />
          </Field>
          <Field label="رقم الهاتف الظاهر في الإعلان" required>
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
          <PrimaryButton type="submit" loading={loading}>
            <SendHorizonal className="size-5" />
            إرسال طلب الإعلان
          </PrimaryButton>
          <p className="text-center text-[11px] font-bold text-ink/45">
            <Megaphone className="inline size-3.5" /> لن يُنشر أي إعلان إلا بعد موافقة الإدارة
          </p>
        </form>
      </div>
    </div>
  );
}
