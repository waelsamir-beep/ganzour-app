import type { ReactNode } from "react";
import { ToastProvider } from "@/components/Toast";
import { AdminGate } from "./gate";

export default function AdminLayout({ children }: { children: ReactNode }) {
  // الحماية من جهة العميل بالتوكن + حماية كاملة للبيانات في الـ APIs
  return (
    <ToastProvider>
      <AdminGate>{children}</AdminGate>
    </ToastProvider>
  );
}
