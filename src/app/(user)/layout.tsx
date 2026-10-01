import type { ReactNode } from "react";
import { BottomNav } from "@/components/BottomNav";
import { ToastProvider } from "@/components/Toast";
import { AdminBanner } from "@/components/AdminBanner";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";

export default function UserLayout({ children }: { children: ReactNode }) {
  // التطبيق مفتوح للجميع بدون أي شاشة دخول —
  // تُنشأ جلسة الزائر تلقائيًا داخل واجهات البيانات عند أول طلب
  return (
    <ToastProvider>
      <div className="relative mx-auto min-h-dvh w-full max-w-[500px] bg-paper shadow-[0_0_60px_-30px_rgb(10_38_36/0.4)]">
        <AdminBanner />
        {children}

        {/* الفوتر */}
        <footer className="relative z-10 -mt-16 px-4 pb-28 pt-2 text-center">
          <p className="text-[11px] font-extrabold leading-relaxed text-ink/55">
            جميع الحقوق محفوظة لمكتب الجمال للدعاية والإعلان
          </p>
          <a
            href="https://wa.me/201222355769"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-flex items-center gap-1.5 text-[11px] font-extrabold text-success transition hover:brightness-90"
          >
            <WhatsAppIcon className="size-4" />
            للتواصل واتساب:
            <span dir="ltr" className="tracking-wide">
              01222355769
            </span>
          </a>
        </footer>

        <BottomNav />
      </div>
    </ToastProvider>
  );
}
