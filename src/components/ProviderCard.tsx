"use client";

import Link from "next/link";
import { Heart, MapPin, MessageCircle, Phone } from "lucide-react";
import type { ProfessionDTO } from "@/lib/types";
import { cn, directionsUrl, whatsappLink } from "@/lib/utils";
import { Avatar } from "./Avatar";
import { StarDisplay } from "./StarRating";
import { api } from "@/lib/api";

export function ProviderCard({
  p,
  onFavoriteChange,
}: {
  p: ProfessionDTO;
  onFavoriteChange?: (id: number, fav: boolean) => void;
}) {
  async function toggleFavorite() {
    const next = !p.isFavorite;
    onFavoriteChange?.(p.id, next);
    try {
      await api("/api/favorites/toggle", {
        method: "POST",
        json: { professionId: p.id },
      });
    } catch {
      onFavoriteChange?.(p.id, !next);
    }
  }

  return (
    <article className="animate-fade-up rounded-2xl border border-mist bg-white p-4 shadow-card transition-shadow hover:shadow-float/40">
      <div className="flex items-start gap-3">
        <Avatar
          name={p.ownerName}
          imageUrl={p.imageUrl}
          iconKey={p.categoryIcon}
          className="size-14 shrink-0 rounded-2xl"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate font-display text-base font-extrabold text-brand-900">
                {p.ownerName}
              </h3>
              <p className="truncate text-sm font-bold text-brand-600">{p.title}</p>
            </div>
            <button
              onClick={toggleFavorite}
              className={cn(
                "grid size-9 shrink-0 place-items-center rounded-xl transition active:scale-90",
                p.isFavorite
                  ? "bg-danger-soft text-danger"
                  : "bg-paper text-ink/35 hover:text-danger"
              )}
              aria-label={p.isFavorite ? "إزالة من المفضلة" : "إضافة للمفضلة"}
            >
              <Heart className={cn("size-5", p.isFavorite && "fill-current")} />
            </button>
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink/55">
            {p.address && (
              <span className="inline-flex max-w-full items-center gap-1">
                <MapPin className="size-3.5 shrink-0 text-brand-500" />
                <span className="truncate">{p.address}</span>
              </span>
            )}
            <StarDisplay value={p.avgRating} count={p.ratingCount} />
          </div>
          <p className="mt-1.5 text-base font-extrabold tracking-wider text-brand-900" dir="ltr">
            {p.phone}
          </p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <a
          href={`tel:${p.phone}`}
          className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-brand-700 text-sm font-extrabold text-white transition hover:bg-brand-800 active:scale-95"
        >
          <Phone className="size-4" /> اتصال
        </a>
        <Link
          href={`/profession/${p.id}`}
          className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-brand-200 bg-brand-50 text-sm font-extrabold text-brand-700 transition hover:bg-brand-100 active:scale-95"
        >
          التفاصيل
        </Link>
        <a
          href={directionsUrl({ lat: p.lat, lng: p.lng, address: p.address, name: p.ownerName })}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-paper text-sm font-extrabold text-ink/70 transition hover:bg-mist active:scale-95"
        >
          <MapPin className="size-4" /> الموقع
        </a>
        {p.whatsapp && (
          <a
            href={whatsappLink(p.whatsapp)}
            target="_blank"
            rel="noopener noreferrer"
            className="col-span-3 inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-success text-sm font-extrabold text-white transition hover:bg-emerald-700 active:scale-95"
          >
            <MessageCircle className="size-4" /> واتساب
          </a>
        )}
      </div>
    </article>
  );
}
