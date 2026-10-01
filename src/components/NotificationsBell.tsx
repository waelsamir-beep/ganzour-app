"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { api } from "@/lib/api";

export function NotificationsBell({ onDark = false }: { onDark?: boolean }) {
  const [unread, setUnread] = useState(0);
  const router = useRouter();

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const data = await api<{ count: number }>("/api/notifications?unread=1");
        if (alive && typeof data.count === "number") setUnread(data.count);
      } catch {
        /* تجاهل */
      }
    }
    load();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <button
      onClick={() => router.push("/notifications")}
      className={
        onDark
          ? "relative grid size-10 place-items-center rounded-xl bg-white/15 text-white transition hover:bg-white/25 active:scale-95"
          : "relative grid size-10 place-items-center rounded-xl bg-white text-brand-800 shadow-card transition hover:bg-brand-50 active:scale-95"
      }
      aria-label="الإشعارات"
    >
      <Bell className="size-5" />
      {unread > 0 && (
        <span className="animate-pulse-dot absolute -top-1 -left-1 grid min-w-5 place-items-center rounded-full bg-danger px-1 text-[10px] font-extrabold text-white">
          {unread > 9 ? "9+" : unread}
        </span>
      )}
    </button>
  );
}
