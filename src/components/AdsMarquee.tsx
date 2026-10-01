"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PhoneCall, Zap } from "lucide-react";
import type { AdDTO } from "@/lib/types";
import { api } from "@/lib/api";

type Item = {
  id: number | string;
  owner: string;
  text: string;
  phone: string | null;
  href: string;
  teaser?: boolean;
};

export function AdsMarquee() {
  const [ads, setAds] = useState<AdDTO[] | null>(null);

  useEffect(() => {
    let alive = true;
    api<{ ads: AdDTO[] }>("/api/ads")
      .then((res) => alive && setAds(res.ads))
      .catch(() => alive && setAds([]));
    return () => {
      alive = false;
    };
  }, []);

  if (ads === null) return null;

  let items: Item[] = ads.map((a) => ({
    id: a.id,
    owner: a.ownerName,
    text: a.text,
    phone: a.phone,
    href: `tel:${a.phone}`,
  }));
  items.push({
    id: "cta",
    owner: "مساحتك الإعلانية",
    text: "أعلن هنا عن نشاطك بمبلغ بسيط — 10 جنيهات شهريًا فقط",
    phone: null,
    href: "/advertise",
    teaser: true,
  });
  while (items.length < 5) items = [...items, ...items];

  return (
    <section className="animate-fade-up">
      <div className="relative overflow-hidden rounded-3xl bg-[#0b1f4b] shadow-card">
        <div className="flex items-stretch">
          {/* شارة عروض خاصة */}
          <div className="relative z-10 m-2.5 flex shrink-0 -rotate-3 items-center gap-1.5 rounded-xl bg-red-500 px-3 py-1.5 shadow-lg">
            <Zap className="size-4.5 fill-amber-300 text-amber-300" />
            <span className="text-center text-[11px] font-extrabold leading-tight text-white">
              عروض
              <br />
              خاصة
            </span>
          </div>

          {/* الشريط المتحرك */}
          <div className="marquee relative flex min-w-0 flex-1 items-center overflow-hidden" dir="ltr">
            <div className="marquee-track flex items-center gap-14 py-4">
              {[...items, ...items].map((item, i) => (
                <Link
                  key={`${item.id}-${i}`}
                  href={item.href}
                  dir="rtl"
                  className="flex shrink-0 items-center gap-2.5 whitespace-nowrap text-base font-extrabold transition hover:text-amber-300"
                >
                  <span className="size-2 shrink-0 rounded-full bg-amber-400" />
                  <span className={item.teaser ? "text-amber-300" : "text-sky-300"}>
                    {item.owner}
                  </span>
                  <span className="text-white">{item.text}</span>
                  {item.phone && (
                    <span className="inline-flex items-center gap-1.5 text-sm font-extrabold text-amber-300">
                      <PhoneCall className="size-4" />
                      <span dir="ltr">{item.phone}</span>
                    </span>
                  )}
                  {item.teaser && (
                    <span className="rounded-full bg-amber-400 px-2.5 py-1 text-xs font-extrabold text-[#0b1f4b]">
                      قدّم الآن
                    </span>
                  )}
                </Link>
              ))}
            </div>
            <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-[#0b1f4b] to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-[#0b1f4b] to-transparent" />
          </div>

          {/* شارة 24 ساعة */}
          <div className="z-10 my-2.5 ml-3 grid size-13 shrink-0 place-items-center rounded-full bg-amber-400 text-center shadow-inner">
            <span className="font-display text-[13px] font-extrabold leading-tight text-[#0b1f4b]">
              24
              <br />
              ساعة
            </span>
          </div>
        </div>
      </div>
      <p className="mt-1.5 text-center text-[11px] font-bold text-ink/45">
        مساحة إعلانية لأهالي جنزور —{" "}
        <Link href="/advertise" className="text-accent-600 underline underline-offset-2">
          اطلب إعلانك الآن
        </Link>
      </p>
    </section>
  );
}
