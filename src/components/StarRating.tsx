"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function StarDisplay({
  value,
  count,
  className,
  size = "size-4",
}: {
  value: number;
  count?: number;
  className?: string;
  size?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      <Star className={cn(size, "fill-amber-400 text-amber-400")} />
      <span className="text-sm font-bold text-ink/80">
        {value > 0 ? value.toFixed(1) : "جديد"}
      </span>
      {count != null && count > 0 && (
        <span className="text-xs text-ink/45">({count})</span>
      )}
    </span>
  );
}

export function StarPicker({
  value,
  onChange,
  className,
}: {
  value: number;
  onChange: (v: number) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-1", className)} dir="ltr">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className="rounded-lg p-1 transition active:scale-90"
          aria-label={`تقييم ${n} من 5`}
        >
          <Star
            className={cn(
              "size-8 transition-colors",
              n <= value ? "fill-amber-400 text-amber-400" : "text-ink/25"
            )}
          />
        </button>
      ))}
    </div>
  );
}
