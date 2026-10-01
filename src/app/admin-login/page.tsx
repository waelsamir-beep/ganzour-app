"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { LogoMark } from "@/components/Logo";
import { Field, PrimaryButton, TextInput } from "@/components/Field";
import { ToastProvider, useToast } from "@/components/Toast";
import { api } from "@/lib/api";
import type { SessionUserDTO } from "@/lib/types";

function AdminLoginForm() {
  const { toast } = useToast();
  const [identity, setIdentity] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [entering, setEntering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // لو داخل بالفعل بحساب أدمن → روح للوحة مباشرة
  useEffect(() => {
    api<{ user: SessionUserDTO }>("/api/me")
      .then((r) => {
        if (r.user.role === "admin") window.location.replace("/admin");
      })
      .catch(() => {});
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!identity.trim() || !password) {
      setError("اكتب رقم الهاتف أو اسم المستخدم وكلمة المرور");
      return;
    }
    setLoading(true);
    try {
      const res = await api<{ ok: boolean; role: string; token: string }>("/api/auth/login", {
        method: "POST",
        json: { identity: identity.trim(), password },
      });
      if (res.role !== "admin") {
        setLoading(false);
        setError("هذا الدخول مخصص لحساب الإدارة فقط");
        return;
      }
      setLoading(false);
      setEntering(true);
      toast("تم تسجيل الدخول — أهلًا بك في لوحة الإدارة 👋");
      // التوكن في الرابط نفسه ليعمل حتى لو حُجب كل التخزين داخل iframes
      setTimeout(() => {
        window.location.href = `/admin#t=${res.token ?? ""}`;
      }, 300);
    } catch (err) {
      setLoading(false);
      const msg = err instanceof Error ? err.message : "تعذر تسجيل الدخول";
      setError(msg);
      toast(msg, "error");
    }
  }

  return (
    <div className="relative grid min-h-dvh place-items-center overflow-hidden bg-gradient-to-b from-brand-950 via-brand-900 to-brand-800 px-5 py-10">
      {/* زخرفة */}
      <div className="absolute -left-16 top-16 size-52 rounded-full bg-brand-500/15" />
      <div className="absolute -right-20 bottom-24 size-64 rounded-full bg-accent-500/10" />
      <div className="absolute right-10 top-10 size-3 rounded-full bg-amber-400/60" />
      <div className="absolute bottom-16 left-14 size-2 rounded-full bg-brand-300/50" />

      <div className="relative w-full max-w-sm">
        <div className="animate-fade-up flex flex-col items-center text-center">
          <LogoMark size={76} />
          <h1 className="mt-4 font-display text-2xl font-extrabold text-white">
            الدليل المهني لقرية جنزور
          </h1>
          <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1.5 text-[11px] font-extrabold text-amber-300">
            <ShieldCheck className="size-4" />
            بوابة دخول الإدارة
          </span>
        </div>

        <form
          onSubmit={onSubmit}
          noValidate
          className="mt-6 animate-fade-up space-y-4 rounded-3xl bg-white p-6 shadow-float [animation-delay:0.12s]"
        >
          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-danger/25 bg-danger-soft px-3.5 py-2.5 text-xs font-extrabold text-danger">
              <AlertCircle className="size-4 shrink-0" />
              {error}
            </div>
          )}

          <Field label="رقم الهاتف أو اسم المستخدم" required>
            <div className="relative">
              <TextInput
                dir="ltr"
                className="pl-4 pr-11 text-left"
                placeholder="01XXXXXXXXX"
                value={identity}
                onChange={(e) => setIdentity(e.target.value)}
                autoComplete="username"
              />
              <UserRound className="absolute right-3.5 top-1/2 size-5 -translate-y-1/2 text-ink/30" />
            </div>
          </Field>
          <Field label="كلمة المرور" required>
            <div className="relative">
              <TextInput
                type={showPassword ? "text" : "password"}
                className="pl-12 pr-11"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <LockKeyhole className="absolute right-3.5 top-1/2 size-5 -translate-y-1/2 text-ink/30" />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-ink/40 transition hover:text-brand-600"
                aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
              >
                {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
              </button>
            </div>
          </Field>

          <PrimaryButton
            type="submit"
            loading={loading}
            disabled={entering}
            className="bg-gradient-to-l from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700"
          >
            <ShieldCheck className="size-5" />
            دخول لوحة الإدارة
          </PrimaryButton>

          {entering && (
            <p className="flex items-center justify-center gap-2 text-xs font-extrabold text-success">
              <Loader2 className="size-4 animate-spin" />
              تم الدخول — جارٍ تحويلك للوحة التحكم...
            </p>
          )}

          <p className="text-center text-[11px] font-bold text-ink/45">
            صفحة مخصصة لفريق الإدارة فقط — الأعضاء يدخلون التطبيق مباشرة بدون تسجيل
          </p>
        </form>

        <p className="mt-5 text-center text-[11px] font-extrabold text-brand-200/70">
          جميع الحقوق محفوظة لمكتب الجمال للدعاية والإعلان
        </p>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <ToastProvider>
      <AdminLoginForm />
    </ToastProvider>
  );
}
