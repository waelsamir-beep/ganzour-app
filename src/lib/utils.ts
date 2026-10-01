import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/** ٠١٠١٢٣٤٥٦٧ → تنسيق الأرقام بفواصل */
export function formatNumber(n: number) {
  return n.toLocaleString("en-US");
}

/** رابط واتساب برقم مصري */
export function whatsappLink(number: string) {
  const cleaned = number.replace(/[^\d]/g, "");
  let intl = cleaned;
  if (cleaned.startsWith("0")) intl = "2" + cleaned;
  else if (!cleaned.startsWith("20")) intl = "20" + cleaned;
  return `https://wa.me/${intl}`;
}

export function normalizePhone(p: string) {
  return p.replace(/[^\d]/g, "");
}

export function isValidEgyptPhone(p: string) {
  const d = normalizePhone(p);
  return /^01[0-9]{9}$/.test(d) || /^201[0-9]{9}$/.test(d) || /^[0-9]{10,}$/.test(d);
}

export function formatDate(d: Date | string) {
  const date = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function formatDateTime(d: Date | string) {
  const date = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat("ar-EG", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function timeAgo(d: Date | string) {
  const date = typeof d === "string" ? new Date(d) : d;
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "منذ لحظات";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `منذ ${minutes === 1 ? "دقيقة" : minutes === 2 ? "دقيقتين" : `${minutes} دقائق`}`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `منذ ${hours === 1 ? "ساعة" : hours === 2 ? "ساعتين" : `${hours} ساعات`}`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `منذ ${days === 1 ? "يوم" : days === 2 ? "يومين" : `${days} أيام`}`;
  return formatDate(date);
}

/** رابط الاتجاهات على خرائط جوجل */
export function directionsUrl(p: { lat?: number | null; lng?: number | null; address?: string | null; name?: string }) {
  if (p.lat != null && p.lng != null) {
    return `https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}`;
  }
  const q = `${p.name ?? ""} ${p.address ?? ""} جنزور المنوفية مصر`.trim();
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}

export function initialsOf(name: string) {
  const parts = name.replace(/^د\.\s*/, "").trim().split(/\s+/);
  return parts
    .slice(0, 2)
    .map((p) => p[0] ?? "")
    .join("");
}
