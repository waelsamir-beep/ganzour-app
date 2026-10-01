"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Settings2 } from "lucide-react";
import { api } from "@/lib/api";
import type { SessionUserDTO } from "@/lib/types";

/** شريط يظهر للأدمن فقط — يعمل بالتوكن حتى داخل iframes */
export function AdminBanner() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let alive = true;
    api<{ user: SessionUserDTO }>("/api/me")
      .then((r) => alive && setIsAdmin(r.user.role === "admin"))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  if (!isAdmin) return null;
  return (
    <Link
      href="/admin"
      className="sticky top-0 z-50 flex items-center justify-center gap-2 bg-brand-950 py-2.5 text-xs font-extrabold text-amber-300 transition hover:text-amber-200"
    >
      <Settings2 className="size-4" />
      أنت مسجل كأدمن — افتح لوحة التحكم
    </Link>
  );
}
