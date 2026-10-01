"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2, Clock, Copy, Headset, Phone, SendHorizonal, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Field, PrimaryButton, TextArea, TextInput } from "@/components/Field";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { LogoMark } from "@/components/Logo";
import { useToast } from "@/components/Toast";
import { api } from "@/lib/api";

const PHONE = "01222355769";
const WA_LINK = "https://wa.me/201222355769";

export default function ContactPage() {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function copyNumber() {
    try {
      await navigator.clipboard.writeText(PHONE);
      toast("تم نسخ الرقم ✅");
    } catch {
      toast("تعذر النسخ", "error");
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSending(true);
    try {
      await api("/api/contact", { method: "POST", json: { name, message } });
      setSent(true);
      setName("");
      setMessage("");
    } catch (err) {
      toast(err instanceof Error ? err.message : "تعذر الإرسال", "error");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="pb-28">
      <PageHeader back title="تواصل معنا" subtitle="يسعدنا خدمتك والرد على استفساراتك" />
      <div className="space-y-4 px-4">
        {/* بطاقة المكتب */}
        <section className="animate-fade-up relative overflow-hidden rounded-3xl bg-gradient-to-l from-brand-900 to-brand-700 p-6 text-center text-white shadow-float">
          <div className="absolute -left-8 -top-8 size-32 rounded-full bg-white/10" />
          <div className="absolute -bottom-10 -right-6 size-28 rounded-full bg-amber-400/20" />
          <div className="relative flex flex-col items-center">
            <LogoMark size={64} />
            <h2 className="mt-3 font-display text-xl font-extrabold">مكتب الجمال للدعاية والإعلان</h2>
            <p className="mt-1 text-xs font-bold text-brand-100">
              الجهة الرسمية المسؤولة عن تطبيق الدليل المهني لقرية جنزور
            </p>
            <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-extrabold">
              <Headset className="size-3.5 text-amber-300" />
              خدمة العملاء يوميًا من 9 صباحًا حتى 10 مساءً
            </span>
          </div>
        </section>

        {/* أزرار التواصل */}
        <section className="stagger grid grid-cols-1 gap-3">
          <a
            href={WA_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-14 items-center justify-center gap-2.5 rounded-2xl bg-[#25D366] text-base font-extrabold text-white shadow-card transition hover:brightness-105 active:scale-[0.98]"
          >
            <WhatsAppIcon className="size-6" />
            راسلنا واتساب مباشرة
          </a>
          <div className="grid grid-cols-2 gap-3">
            <a
              href={`tel:${PHONE}`}
              className="flex h-14 flex-col items-center justify-center gap-0.5 rounded-2xl bg-brand-600 text-white shadow-card transition hover:bg-brand-700 active:scale-[0.98]"
            >
              <span className="flex items-center gap-1.5 text-sm font-extrabold">
                <Phone className="size-4" /> اتصال هاتفي
              </span>
              <span className="text-[11px] font-bold text-brand-100" dir="ltr">
                {PHONE}
              </span>
            </a>
            <button
              onClick={copyNumber}
              className="flex h-14 flex-col items-center justify-center gap-0.5 rounded-2xl border border-mist bg-white text-brand-800 shadow-card transition hover:bg-brand-50 active:scale-[0.98]"
            >
              <span className="flex items-center gap-1.5 text-sm font-extrabold">
                <Copy className="size-4" /> نسخ الرقم
              </span>
              <span className="text-[11px] font-bold text-ink/45" dir="ltr">
                {PHONE}
              </span>
            </button>
          </div>
        </section>

        {/* نموذج رسالة */}
        <section className="animate-fade-up rounded-3xl border border-mist bg-white p-5 shadow-card [animation-delay:0.1s]">
          <h3 className="font-display text-base font-extrabold text-brand-950">ابعتلنا رسالة</h3>
          <p className="mt-0.5 text-xs font-bold text-ink/50">
            اقتراح، استفسار، أو طلب إضافة نشاط — بتوصلنا فورًا
          </p>
          {sent ? (
            <div className="mt-4 flex flex-col items-center gap-2 rounded-2xl bg-success-soft p-6 text-center">
              <CheckCircle2 className="size-10 text-success" />
              <p className="text-sm font-extrabold text-success">تم إرسال رسالتك بنجاح ✅</p>
              <p className="text-xs font-bold text-ink/55">سيتواصل معك فريق الإدارة قريبًا</p>
              <button
                onClick={() => setSent(false)}
                className="mt-1 text-xs font-extrabold text-brand-700 underline underline-offset-4"
              >
                إرسال رسالة أخرى
              </button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="mt-4 space-y-4">
              <Field label="اسمك" required>
                <TextInput
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="اكتب اسمك"
                  required
                  minLength={2}
                />
              </Field>
              <Field label="رسالتك" required>
                <TextArea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="اكتب رسالتك هنا..."
                  required
                  minLength={5}
                />
              </Field>
              <PrimaryButton type="submit" loading={sending}>
                <SendHorizonal className="size-5" />
                إرسال الرسالة
              </PrimaryButton>
            </form>
          )}
        </section>

        {/* ثقة وأمان */}
        <section className="animate-fade-up flex items-center gap-3 rounded-2xl border border-mist bg-white p-4 shadow-card [animation-delay:0.16s]">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-success-soft text-success">
            <ShieldCheck className="size-5" />
          </span>
          <p className="text-xs font-bold leading-relaxed text-ink/60">
            بياناتك في أمان تام ولا تُشارك مع أي جهة خارجية. كل المهن والإعلانات تُنشر بعد مراجعة
            الإدارة لضمان مصداقية الدليل.
          </p>
        </section>

        <section className="animate-fade-up flex items-center gap-3 rounded-2xl border border-mist bg-white p-4 shadow-card [animation-delay:0.2s]">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-warning-soft text-warning">
            <Clock className="size-5" />
          </span>
          <p className="text-xs font-bold leading-relaxed text-ink/60">
            متوسط زمن الرد على الرسائل أقل من 24 ساعة، وعلى الواتساب خلال دقائق في مواعيد العمل.
          </p>
        </section>
      </div>
    </div>
  );
}
