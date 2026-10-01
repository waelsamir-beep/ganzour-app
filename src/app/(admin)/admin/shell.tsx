"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ClipboardCheck,
  Eye,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Megaphone,
  ShieldCheck,
  UsersRound,
  Wrench,
} from "lucide-react";
import { LogoMark } from "@/components/Logo";
import { cn } from "@/lib/utils";
import { api, clearToken } from "@/lib/api";

const NAV = [
  { href: "/admin", label: "لوحة التحكم", icon: LayoutDashboard, exact: true },
  { href: "/admin/requests", label: "طلبات المراجعة", icon: ClipboardCheck },
  { href: "/admin/ads", label: "الإعلانات", icon: Megaphone },
  { href: "/admin/professions", label: "إدارة المهن", icon: Wrench },
  { href: "/admin/members", label: "الأعضاء", icon: UsersRound },
  { href: "/admin/categories", label: "الأقسام", icon: FolderKanban },
];

export function AdminShell({
  adminName,
  children,
}: {
  adminName: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [pending, setPending] = useState(0);
  const [pendingAds, setPendingAds] = useState(0);

  useEffect(() => {
    let alive = true;
    api<{ pending: number; pendingAds: number }>("/api/admin/stats")
      .then((d) => {
        if (!alive) return;
        if (typeof d.pending === "number") setPending(d.pending);
        if (typeof d.pendingAds === "number") setPendingAds(d.pendingAds);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [pathname]);

  async function logout() {
    clearToken();
    await api("/api/auth/logout", { method: "POST" }).catch(() => {});
    router.replace("/admin-login");
  }

  return (
    <div className="min-h-dvh bg-paper">
      <div className="mx-auto flex min-h-dvh w-full max-w-6xl">
        {/* الشريط الجانبي */}
        <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col bg-brand-950 p-4 text-white md:flex">
          <div className="flex items-center gap-2.5 px-2 py-2">
            <LogoMark size={38} />
            <div>
              <p className="font-display text-sm font-extrabold leading-tight">الدليل المهني</p>
              <p className="text-[10px] font-bold text-brand-300">لوحة تحكم الإدارة</p>
            </div>
          </div>
          <nav className="mt-5 flex-1 space-y-1">
            {NAV.map(({ href, label, icon: Icon, exact }) => {
              const active = exact ? pathname === href : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-extrabold transition",
                    active
                      ? "bg-brand-700 text-white"
                      : "text-brand-200/80 hover:bg-brand-900 hover:text-white"
                  )}
                >
                  <Icon className="size-4.5" />
                  <span className="flex-1">{label}</span>
                  {href === "/admin/requests" && pending > 0 && (
                    <span className="grid min-w-5.5 place-items-center rounded-full bg-danger px-1.5 py-0.5 text-[10px] font-extrabold text-white">
                      🔴 {pending}
                    </span>
                  )}
                  {href === "/admin/ads" && pendingAds > 0 && (
                    <span className="grid min-w-5.5 place-items-center rounded-full bg-amber-400 px-1.5 py-0.5 text-[10px] font-extrabold text-brand-950">
                      {pendingAds}
                    </span>
                  )}
                </Link>
              );
            })}
            <Link
              href="/admin/settings"
              className={cn(
                "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-extrabold transition",
                pathname.startsWith("/admin/settings")
                  ? "bg-brand-700 text-white"
                  : "text-brand-200/80 hover:bg-brand-900 hover:text-white"
              )}
            >
              <ShieldCheck className="size-4.5" />
              الإعدادات والأمان
            </Link>
          </nav>
          <div className="space-y-1 border-t border-brand-800 pt-3">
            <Link
              href="/home"
              className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-extrabold text-brand-200/80 transition hover:bg-brand-900 hover:text-white"
            >
              <Eye className="size-4.5" />
              عرض التطبيق
            </Link>
            <button
              onClick={logout}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-extrabold text-red-300 transition hover:bg-danger/20"
            >
              <LogOut className="size-4.5" />
              تسجيل الخروج
            </button>
          </div>
        </aside>

        {/* المحتوى */}
        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 border-b border-mist bg-white/90 backdrop-blur">
            <div className="flex items-center justify-between gap-3 px-4 py-3 md:px-6">
              <div className="flex items-center gap-2.5 md:hidden">
                <LogoMark size={34} />
                <p className="font-display text-sm font-extrabold text-brand-900">لوحة الإدارة</p>
              </div>
              <p className="hidden text-sm font-bold text-ink/50 md:block">
                مرحبًا <span className="font-extrabold text-brand-800">{adminName}</span> 👋
              </p>
              <div className="flex items-center gap-2">
                <Link
                  href="/home"
                  className="rounded-xl border border-mist bg-white px-3 py-2 text-xs font-extrabold text-brand-700 transition hover:bg-brand-50 md:hidden"
                >
                  عرض التطبيق
                </Link>
                <button
                  onClick={logout}
                  className="rounded-xl border border-mist bg-white p-2 text-danger transition hover:bg-danger-soft md:hidden"
                  aria-label="تسجيل الخروج"
                >
                  <LogOut className="size-4" />
                </button>
              </div>
            </div>
            {/* تبويبات الجوال */}
            <nav className="flex gap-1.5 overflow-x-auto px-4 pb-2.5 md:hidden">
              {[...NAV, { href: "/admin/settings", label: "الإعدادات", icon: ShieldCheck }].map(
                ({ href, label }) => {
                  const active =
                    href === "/admin" ? pathname === href : pathname.startsWith(href);
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={cn(
                        "flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-extrabold transition",
                        active ? "bg-brand-700 text-white" : "bg-paper text-ink/60"
                      )}
                    >
                      {label}
                      {href === "/admin/requests" && pending > 0 && (
                        <span className="grid min-w-5 place-items-center rounded-full bg-danger px-1 text-[10px] text-white">
                          {pending}
                        </span>
                      )}
                      {href === "/admin/ads" && pendingAds > 0 && (
                        <span className="grid min-w-5 place-items-center rounded-full bg-amber-400 px-1 text-[10px] text-brand-950">
                          {pendingAds}
                        </span>
                      )}
                    </Link>
                  );
                }
              )}
            </nav>
          </header>
          <main className="p-4 md:p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
