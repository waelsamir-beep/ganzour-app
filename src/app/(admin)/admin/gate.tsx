"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { Home, ShieldAlert } from "lucide-react";
import { LogoMark } from "@/components/Logo";
import { AdminShell } from "./shell";
import { api } from "@/lib/api";
import type { SessionUserDTO } from "@/lib/types";

/**
 * بوابة لوحة الإدارة من جهة العميل:
 * تعمل بالتوكن المحفوظ (Bearer) فلا تتأثر بحجب الكوكيز داخل iframes.
 * البيانات نفسها محمية في كل الـ APIs بصلاحيات الأدمن.
 */
export function AdminGate({ children }: { children: ReactNode }) {
  const [state, setState] = useState<"loading" | "admin" | "denied">("loading");
  const [name, setName] = useState("");

  useEffect(() => {
    let alive = true;
    api<{ user: SessionUserDTO }>("/api/me")
      .then((r) => {
        if (!alive) return;
        if (r.user.role === "admin") {
          setName(r.user.name);
          setState("admin");
        } else {
          setState("denied");
        }
      })
      .catch(() => alive && setState("denied"));
    return () => {
      alive = false;
    };
  }, []);

  if (state === "loading") {
    return (
      <div className="grid min-h-dvh place-items-center bg-brand-950">
        <div className="flex flex-col items-center gap-3">
          <LogoMark size={64} />
          <span className="size-6 animate-spin rounded-full border-2 border-white/30 border-t-amber-400" />
          <p className="text-xs font-extrabold text-brand-200">جارٍ التحقق من الصلاحيات...</p>
        </div>
      </div>
    );
  }

  if (state === "denied") {
    return (
      <div className="grid min-h-dvh place-items-center bg-gradient-to-b from-brand-950 to-brand-800 px-5">
        <div className="w-full max-w-sm rounded-3xl bg-white p-7 text-center shadow-float">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-danger-soft text-danger">
            <ShieldAlert className="size-7" />
          </span>
          <h1 className="mt-4 font-display text-xl font-extrabold text-brand-950">
            منطقة مخصصة للإدارة
          </h1>
          <p className="mt-2 text-sm font-bold leading-relaxed text-ink/55">
            يجب تسجيل الدخول بحساب الإدارة للوصول إلى لوحة التحكم.
          </p>
          <Link
            href="/admin-login"
            className="mt-5 flex h-12 items-center justify-center rounded-xl bg-gradient-to-l from-accent-500 to-accent-600 text-sm font-extrabold text-white transition hover:brightness-105 active:scale-[0.98]"
          >
            تسجيل دخول الإدارة
          </Link>
          <Link
            href="/home"
            className="mt-2 flex h-12 items-center justify-center gap-2 rounded-xl border border-mist bg-white text-sm font-extrabold text-brand-700 transition hover:bg-brand-50"
          >
            <Home className="size-4" />
            العودة للتطبيق
          </Link>
        </div>
      </div>
    );
  }

  return <AdminShell adminName={name}>{children}</AdminShell>;
}
