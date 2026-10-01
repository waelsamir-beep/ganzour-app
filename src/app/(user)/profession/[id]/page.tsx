"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Clock,
  Heart,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Star,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Avatar } from "@/components/Avatar";
import { StarDisplay, StarPicker } from "@/components/StarRating";
import { useToast } from "@/components/Toast";
import { CategoryIcon } from "@/components/CategoryIcon";
import type { ProfessionDTO } from "@/lib/types";
import { api } from "@/lib/api";
import { cn, directionsUrl, whatsappLink } from "@/lib/utils";

export default function ProfessionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [p, setP] = useState<ProfessionDTO | null>(null);
  const [userRating, setUserRating] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    api<{ profession: ProfessionDTO; userRating: number }>(`/api/professions/${id}`)
      .then((res) => {
        if (!alive) return;
        setP(res.profession);
        setUserRating(res.userRating);
      })
      .catch(() => toast("العنصر غير موجود", "error"))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function toggleFavorite() {
    if (!p) return;
    const next = !p.isFavorite;
    setP({ ...p, isFavorite: next });
    try {
      await api("/api/favorites/toggle", {
        method: "POST",
        json: { professionId: p.id },
      });
      toast(next ? "تمت الإضافة إلى المفضلة ❤️" : "تمت الإزالة من المفضلة", "info");
    } catch {
      setP({ ...p, isFavorite: !next });
    }
  }

  async function rate(stars: number) {
    if (!p) return;
    setUserRating(stars);
    try {
      await api(`/api/professions/${p.id}/rate`, { method: "POST", json: { stars } });
      toast("شكرًا لتقييمك ⭐");
    } catch {
      toast("تعذر حفظ التقييم", "error");
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 px-4 pb-28 pt-4">
        <div className="h-12 w-full animate-pulse rounded-2xl bg-mist" />
        <div className="h-56 animate-pulse rounded-3xl bg-mist" />
        <div className="h-40 animate-pulse rounded-3xl bg-mist" />
      </div>
    );
  }

  if (!p) {
    return (
      <div className="pb-28">
        <PageHeader back title="التفاصيل" />
        <p className="px-4 text-sm text-ink/60">تعذر العثور على هذا العنصر.</p>
      </div>
    );
  }

  return (
    <div className="pb-28">
      <PageHeader back title="تفاصيل الخدمة" right={null} />

      <div className="space-y-4 px-4">
        {/* البطاقة الرئيسية */}
        <section className="animate-fade-up overflow-hidden rounded-3xl border border-mist bg-white shadow-card">
          <div className="bg-gradient-to-l from-brand-800 to-brand-600 px-5 pb-12 pt-5">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-extrabold text-white">
                <ShieldCheck className="size-3.5" />
                خدمة معتمدة من الإدارة
              </span>
              <button
                onClick={toggleFavorite}
                className={cn(
                  "grid size-10 place-items-center rounded-xl transition active:scale-90",
                  p.isFavorite ? "bg-white text-danger" : "bg-white/15 text-white"
                )}
                aria-label="إضافة للمفضلة"
              >
                <Heart className={cn("size-5", p.isFavorite && "fill-current")} />
              </button>
            </div>
          </div>
          <div className="-mt-9 px-5 pb-5">
            <Avatar
              name={p.ownerName}
              imageUrl={p.imageUrl}
              iconKey={p.categoryIcon}
              className="size-20 rounded-3xl border-4 border-white shadow-card"
            />
            <h1 className="mt-3 font-display text-xl font-extrabold text-brand-900">
              {p.ownerName}
            </h1>
            <p className="text-sm font-extrabold text-brand-600">{p.title}</p>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs font-bold text-ink/55">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-brand-700">
                <CategoryIcon
                  iconKey={p.categoryIcon}
                  seed={p.categoryId}
                  className="hidden"
                />
                {p.categoryName}
              </span>
              <StarDisplay value={p.avgRating} count={p.ratingCount} />
            </div>
          </div>
        </section>

        {/* أزرار التواصل */}
        <section className="stagger grid grid-cols-2 gap-3">
          <a
            href={`tel:${p.phone}`}
            className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-brand-700 text-sm font-extrabold text-white shadow-card transition hover:bg-brand-800 active:scale-95"
          >
            <Phone className="size-5" /> اتصال
          </a>
          {p.whatsapp ? (
            <a
              href={whatsappLink(p.whatsapp)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-success text-sm font-extrabold text-white shadow-card transition hover:brightness-105 active:scale-95"
            >
              <MessageCircle className="size-5" /> واتساب
            </a>
          ) : (
            <span className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-mist/60 text-sm font-extrabold text-ink/35">
              <MessageCircle className="size-5" /> واتساب غير متاح
            </span>
          )}
          <a
            href={directionsUrl({ lat: p.lat, lng: p.lng, address: p.address, name: p.ownerName })}
            target="_blank"
            rel="noopener noreferrer"
            className="col-span-2 flex h-12 items-center justify-center gap-2 rounded-2xl bg-sea-500 text-sm font-extrabold text-white shadow-card transition hover:bg-sea-600 active:scale-95"
          >
            <MapPin className="size-5" /> الموقع والاتجاهات
          </a>
        </section>

        {/* معلومات */}
        <section className="animate-fade-up space-y-3 rounded-3xl border border-mist bg-white p-5 shadow-card">
          <h2 className="font-display text-base font-extrabold text-brand-900">معلومات الخدمة</h2>
          {p.description && (
            <p className="text-sm font-medium leading-relaxed text-ink/75">{p.description}</p>
          )}
          <div className="space-y-2.5 border-t border-mist pt-3 text-sm">
            <div className="flex items-center gap-2">
              <Phone className="size-4 shrink-0 text-brand-500" />
              <span className="font-bold text-ink/70" dir="ltr">
                {p.phone}
              </span>
            </div>
            {p.whatsapp && (
              <div className="flex items-center gap-2">
                <MessageCircle className="size-4 shrink-0 text-success" />
                <span className="font-bold text-ink/70" dir="ltr">
                  {p.whatsapp}
                </span>
                <span className="text-[11px] font-bold text-ink/40">(واتساب)</span>
              </div>
            )}
            {p.address && (
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0 text-brand-500" />
                <span className="font-bold text-ink/70">{p.address}</span>
              </div>
            )}
            {p.workingHours && (
              <div className="flex items-start gap-2">
                <Clock className="mt-0.5 size-4 shrink-0 text-warning" />
                <span className="font-bold text-ink/70">مواعيد العمل: {p.workingHours}</span>
              </div>
            )}
          </div>
        </section>

        {/* التقييم */}
        <section className="animate-fade-up rounded-3xl border border-mist bg-white p-5 shadow-card">
          <div className="flex items-center gap-2">
            <Star className="size-5 fill-amber-400 text-amber-400" />
            <h2 className="font-display text-base font-extrabold text-brand-900">قيّم هذه الخدمة</h2>
          </div>
          <p className="mt-1 text-xs font-bold text-ink/50">
            {userRating > 0
              ? `تقييمك الحالي: ${userRating} من 5`
              : "شارك رأيك ليستفيد أبناء القرية"}
          </p>
          <StarPicker value={userRating} onChange={rate} className="mt-3" />
        </section>
      </div>
    </div>
  );
}
