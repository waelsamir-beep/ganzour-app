import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="animate-fade-up flex flex-col items-center gap-2 rounded-3xl border border-dashed border-mist bg-white/60 px-6 py-12 text-center">
      <div className="grid size-14 place-items-center rounded-2xl bg-brand-50 text-brand-500">
        <Icon className="size-7" />
      </div>
      <h3 className="mt-1 font-display text-base font-extrabold text-brand-900">{title}</h3>
      {description && <p className="max-w-xs text-sm leading-relaxed text-ink/50">{description}</p>}
      {action}
    </div>
  );
}
