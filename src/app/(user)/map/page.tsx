"use client";

import { useEffect, useMemo, useState } from "react";
import { MapPinned, Navigation, Search } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import type { ProfessionDTO } from "@/lib/types";
import { api } from "@/lib/api";
import { directionsUrl } from "@/lib/utils";

const QUICK = ["طبيب قريب", "عيادة", "صيدلية", "ورشة", "كهربائي", "سباك"];

/** إحداثيات مركز قرية جنزور التقريبية */
const CENTER = { lat: 30.4325, lng: 30.9568 };

export default function MapPage() {
  const [items, setItems] = useState<ProfessionDTO[]>([]);
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<ProfessionDTO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    api<{ professions: ProfessionDTO[] }>("/api/professions")
      .then((res) => alive && setItems(res.professions))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const query = q.trim();
    if (!query) return items;
    return items.filter((p) =>
      [p.ownerName, p.title, p.categoryName, p.address ?? "", p.description ?? ""]
        .join(" ")
        .includes(query)
    );
  }, [items, q]);

  const marker = selected ?? undefined;
  const delta = 0.012;
  const bbox = `${CENTER.lng - delta * 2},${CENTER.lat - delta},${CENTER.lng + delta * 2},${CENTER.lat + delta}`;
  const embedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik${
    marker && marker.lat != null && marker.lng != null
      ? `&marker=${marker.lat},${marker.lng}`
      : `&marker=${CENTER.lat},${CENTER.lng}`
  }`;

  return (
    <div className="pb-28">
      <PageHeader title="الخريطة" subtitle="مقدمو الخدمات المعتمدون في جنزور" />
      <div className="space-y-4 px-4">
        {/* بحث سريع */}
        <div className="flex items-center gap-2 rounded-2xl border border-mist bg-white px-4 py-3 shadow-card focus-within:border-brand-400 focus-within:ring-4 focus-within:ring-brand-100">
          <Search className="size-5 shrink-0 text-brand-500" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ابحث: طبيب، صيدلية، ورشة..."
            className="w-full bg-transparent text-sm font-bold outline-none placeholder:font-medium placeholder:text-ink/35"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {QUICK.map((term) => (
            <button
              key={term}
              onClick={() => setQ(term)}
              className="shrink-0 rounded-full border border-brand-200 bg-brand-50 px-4 py-2 text-xs font-extrabold text-brand-700 transition hover:bg-brand-100 active:scale-95"
            >
              {term}
            </button>
          ))}
        </div>

        {/* الخريطة */}
        <div className="overflow-hidden rounded-3xl border border-mist bg-white shadow-card">
          <div className="flex items-center justify-between px-4 py-3">
            <p className="inline-flex items-center gap-1.5 text-sm font-extrabold text-brand-900">
              <MapPinned className="size-4 text-brand-600" />
              {selected ? selected.ownerName : "قرية جنزور — مركز بركة السبع"}
            </p>
            {selected && (
              <button
                onClick={() => setSelected(null)}
                className="text-xs font-extrabold text-brand-600 hover:text-brand-800"
              >
                عرض الكل
              </button>
            )}
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <iframe
            key={embedUrl}
            src={embedUrl}
            title="خريطة جنزور"
            className="h-64 w-full border-0"
            loading="lazy"
          />
        </div>

        {/* النتائج */}
        <div className="space-y-2.5">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-2xl bg-mist" />
            ))
          ) : filtered.length === 0 ? (
            <EmptyState icon={Search} title="لا توجد نتائج قريبة" />
          ) : (
            filtered.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelected(p)}
                className="flex w-full items-center gap-3 rounded-2xl border border-mist bg-white p-3.5 text-right shadow-card transition hover:border-brand-300 active:scale-[0.98]"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-extrabold text-brand-900">{p.ownerName}</p>
                  <p className="truncate text-xs font-bold text-brand-600">{p.title}</p>
                  {p.address && (
                    <p className="mt-0.5 truncate text-[11px] font-medium text-ink/45">{p.address}</p>
                  )}
                </div>
                <a
                  href={directionsUrl({ lat: p.lat, lng: p.lng, address: p.address, name: p.ownerName })}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl bg-sea-500 px-4 text-xs font-extrabold text-white transition hover:bg-sea-600 active:scale-95"
                >
                  <Navigation className="size-4" />
                  الاتجاهات
                </a>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
