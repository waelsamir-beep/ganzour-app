"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Home, Megaphone, Plus, Search, UserRound, Wrench, X } from "lucide-react";
import { cn } from "@/lib/utils";

const RIGHT = [
  { href: "/home", label: "الرئيسية", icon: Home },
  { href: "/search", label: "بحث", icon: Search },
];
const LEFT = [
  { href: "/notifications", label: "الإشعارات", icon: Bell },
  { href: "/profile", label: "حسابي", icon: UserRound },
];

export function BottomNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  function Item({ href, label, icon: Icon }: (typeof RIGHT)[number]) {
    const active = pathname.startsWith(href);
    return (
      <Link href={href} className="group flex flex-col items-center gap-1 py-1.5">
        <span
          className={cn(
            "grid h-9 w-14 place-items-center rounded-full transition-all duration-300",
            active
              ? "bg-gradient-to-b from-accent-400 to-accent-600 text-white shadow-md shadow-accent-500/40"
              : "text-ink/40 group-hover:bg-mist/70 group-hover:text-ink/60"
          )}
        >
          <Icon className="size-5" strokeWidth={active ? 2.6 : 2} />
        </span>
        <span
          className={cn(
            "text-[10px] font-extrabold transition-colors",
            active ? "text-accent-600" : "text-ink/45"
          )}
        >
          {label}
        </span>
      </Link>
    );
  }

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-40 pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto w-full max-w-[500px] px-4 pb-3">
          <div className="relative grid grid-cols-5 items-end rounded-[28px] border border-mist/80 bg-white/95 px-1.5 pb-1.5 pt-1.5 shadow-float backdrop-blur-xl">
            {RIGHT.map((it) => (
              <Item key={it.href} {...it} />
            ))}
            {/* الزر الأوسط */}
            <div className="relative flex flex-col items-center">
              <button
                onClick={() => setOpen(true)}
                className="absolute -top-7 grid size-13 place-items-center rounded-full bg-gradient-to-b from-accent-400 to-accent-600 text-white shadow-lg shadow-accent-600/50 ring-4 ring-paper transition hover:from-brand-500 hover:to-brand-700 hover:shadow-brand-700/40 active:scale-90"
                aria-label="إضافة"
              >
                <Plus className="size-6" strokeWidth={3} />
              </button>
              <span className="pb-1 pt-7 text-[10px] font-extrabold text-ink/45">إضافة</span>
            </div>
            {LEFT.map((it) => (
              <Item key={it.href} {...it} />
            ))}
          </div>
        </div>
      </nav>

      {/* لوحة الاختيار */}
      {open && (
        <div className="fixed inset-0 z-[95] flex items-end justify-center">
          <button
            aria-label="إغلاق"
            className="animate-fade-in absolute inset-0 bg-brand-950/55 backdrop-blur-[2px]"
            onClick={() => setOpen(false)}
          />
          <div className="animate-fade-up relative z-10 w-full max-w-[500px] rounded-t-3xl bg-white p-5 pb-8 shadow-float">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-lg font-extrabold text-brand-950">ماذا تريد أن تضيف؟</h3>
              <button
                onClick={() => setOpen(false)}
                className="grid size-9 place-items-center rounded-xl bg-paper text-ink/60 transition hover:bg-mist active:scale-95"
                aria-label="إغلاق"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="space-y-3">
              <Link
                href="/add-profession"
                className="flex items-center gap-3 rounded-2xl border-2 border-accent-200 bg-accent-50 p-4 transition hover:border-accent-400 active:scale-[0.98]"
              >
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-b from-accent-400 to-accent-600 text-white">
                  <Wrench className="size-6" />
                </span>
                <span>
                  <span className="block font-display text-base font-extrabold text-accent-800">
                    إضافة مهنة أو خدمة
                  </span>
                  <span className="block text-xs font-bold text-ink/55">
                    أضف مهنتك إلى الدليل — تُنشر بعد مراجعة الإدارة
                  </span>
                </span>
              </Link>
              <Link
                href="/advertise"
                className="flex items-center gap-3 rounded-2xl border-2 border-brand-200 bg-brand-50 p-4 transition hover:border-brand-400 active:scale-[0.98]"
              >
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-b from-brand-500 to-brand-700 text-white">
                  <Megaphone className="size-6" />
                </span>
                <span>
                  <span className="block font-display text-base font-extrabold text-brand-800">
                    أضف إعلانك في الماركيو
                  </span>
                  <span className="block text-xs font-bold text-ink/55">
                    مساحة إعلانية بمبلغ بسيط تظهر لكل أهل القرية
                  </span>
                </span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
