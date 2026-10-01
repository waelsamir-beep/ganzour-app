import {
  Briefcase,
  Camera,
  Car,
  Folder,
  GraduationCap,
  Home,
  Hospital,
  Pill,
  Printer,
  Scissors,
  Shirt,
  Stethoscope,
  Store,
  Tractor,
  UtensilsCrossed,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = {
  stethoscope: Stethoscope,
  hospital: Hospital,
  pill: Pill,
  wrench: Wrench,
  store: Store,
  car: Car,
  home: Home,
  briefcase: Briefcase,
  folder: Folder,
  scissors: Scissors,
  utensils: UtensilsCrossed,
  graduation: GraduationCap,
  tractor: Tractor,
  printer: Printer,
  camera: Camera,
  shirt: Shirt,
};

const TONES = [
  "bg-brand-100 text-brand-700",
  "bg-sea-100 text-sea-600",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-600",
  "bg-violet-100 text-violet-600",
  "bg-cyan-100 text-cyan-700",
  "bg-orange-100 text-orange-600",
];

/** أيقونة القسم فقط (بدون حاوية ملونة) */
export function CategoryGlyph({
  iconKey,
  className,
}: {
  iconKey?: string;
  className?: string;
}) {
  const Icon = ICONS[iconKey ?? ""] ?? Folder;
  return <Icon className={className} strokeWidth={2.1} />;
}

export function CategoryIcon({
  iconKey,
  seed = 0,
  className,
  iconClassName,
}: {
  iconKey: string;
  seed?: number;
  className?: string;
  iconClassName?: string;
}) {
  const Icon = ICONS[iconKey] ?? Folder;
  const tone = TONES[seed % TONES.length];
  return (
    <div className={cn("grid place-items-center rounded-2xl", tone, className)}>
      <Icon className={cn("size-6", iconClassName)} strokeWidth={2.2} />
    </div>
  );
}
