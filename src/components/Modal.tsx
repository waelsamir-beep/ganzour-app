"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Modal({
  open,
  onClose,
  title,
  children,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center">
      <button
        aria-label="إغلاق"
        className="animate-fade-in absolute inset-0 bg-brand-950/55 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        className={cn(
          "animate-fade-up relative z-10 max-h-[88dvh] w-full overflow-y-auto rounded-t-3xl bg-white p-5 shadow-float sm:rounded-3xl",
          wide ? "sm:max-w-2xl" : "sm:max-w-md"
        )}
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          {title ? (
            <h3 className="font-display text-lg font-extrabold text-brand-900">{title}</h3>
          ) : (
            <span />
          )}
          <button
            onClick={onClose}
            className="grid size-9 place-items-center rounded-xl bg-paper text-ink/60 transition hover:bg-mist active:scale-95"
            aria-label="إغلاق النافذة"
          >
            <X className="size-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
