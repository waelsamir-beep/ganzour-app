"use client";

import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  subtitle,
  back = false,
  right,
  className,
}: {
  title: string;
  subtitle?: string;
  back?: boolean;
  right?: ReactNode;
  className?: string;
}) {
  const router = useRouter();
  return (
    <header className={cn("sticky top-0 z-30 bg-paper/90 backdrop-blur", className)}>
      <div className="flex items-center gap-3 px-4 py-3">
        {back && (
          <button
            onClick={() => router.back()}
            className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-brand-800 shadow-card transition hover:bg-brand-50 active:scale-95"
            aria-label="رجوع"
          >
            <ArrowRight className="size-5" />
          </button>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-lg font-extrabold text-brand-900">
            {title}
          </h1>
          {subtitle && <p className="truncate text-xs text-ink/50">{subtitle}</p>}
        </div>
        {right}
      </div>
    </header>
  );
}
