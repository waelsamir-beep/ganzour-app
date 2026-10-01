export type RequestStatus = "pending" | "approved" | "rejected";

export const STATUS_META: Record<
  RequestStatus,
  { label: string; dot: string; badge: string }
> = {
  pending: {
    label: "قيد المراجعة",
    dot: "bg-warning",
    badge: "bg-warning-soft text-warning",
  },
  approved: {
    label: "تمت الموافقة",
    dot: "bg-success",
    badge: "bg-success-soft text-success",
  },
  rejected: {
    label: "مرفوض",
    dot: "bg-danger",
    badge: "bg-danger-soft text-danger",
  },
};

/** الأيقونات المتاحة للأقسام */
export const CATEGORY_ICONS = [
  "stethoscope",
  "hospital",
  "pill",
  "wrench",
  "store",
  "car",
  "home",
  "briefcase",
  "folder",
  "scissors",
  "utensils",
  "graduation",
  "tractor",
  "printer",
  "camera",
  "shirt",
] as const;

export type CategoryIconKey = (typeof CATEGORY_ICONS)[number];

export const CATEGORY_ICON_LABELS: Record<CategoryIconKey, string> = {
  stethoscope: "طبي",
  hospital: "مستشفى",
  pill: "صيدلية",
  wrench: "حرفي",
  store: "محل",
  car: "سيارات",
  home: "منزلي",
  briefcase: "مهني",
  folder: "عام",
  scissors: "حلاقة",
  utensils: "مأكولات",
  graduation: "تعليم",
  tractor: "زراعي",
  printer: "طباعة",
  camera: "تصوير",
  shirt: "ملابس",
};
