"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ClipboardList,
  Flame,
  Hammer,
  Heart,
  LayoutGrid,
  MapPin,
  PhoneCall,
  Plus,
  Search,
  ShieldCheck,
  Star,
  Users2,
} from "lucide-react";
import { NotificationsBell } from "@/components/NotificationsBell";
import { CategoryIcon } from "@/components/CategoryIcon";
import { AdsMarquee } from "@/components/AdsMarquee";
import type { CategoryDTO, ProfessionDTO } from "@/lib/types";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

type Community = {
  members: number;
  professions: number;
  categories: number;
  ratings: number;
};

const QUICK = [
  { label: "المفضلة", icon: Heart, href: "/favorites", active: false },
  { label: "موثوق", icon: ShieldCheck, href: "/search", active: false },
  { label: "الأقرب لك", icon: MapPin, href: "/map", active: false },
  { label: "المميزون", icon: Star, href: "/search?sort=rating", active: false },
  { label: "كل الأقسام", icon: LayoutGrid, href: "/categories", active: true },
];

const EMERGENCY = [
  { label: "الإسعاف", num: "123" },
  { label: "الشرطة", num: "122" },
  { label: "الكهرباء", num: "121" },
  { label: "الغاز", num: "129" },
  { label: "المياه", num: "125" },
];

export default function HomePage() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [cats, setCats] = useState<CategoryDTO[]>([]);
  const [items, setItems] = useState<ProfessionDTO[]>([]);
  const [community, setCommunity] = useState<Community | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    let alive = true;
    (async () => {
      const [catsRes, profRes, comRes] = await Promise.allSettled([
        api<{ categories: CategoryDTO[] }>("/api/categories"),
        api<{ professions: ProfessionDTO[] }>("/api/professions"),
        api<Community>("/api/community"),
      ]);
      if (!alive) return;

      if (catsRes.status === "fulfilled") setCats(catsRes.value.categories);
      if (profRes.status === "fulfilled") setItems(profRes.value.professions);
      if (comRes.status === "fulfilled") setCommunity(comRes.value);
      setLoadError(
        catsRes.status === "rejected" ||
          profRes.status === "rejected" ||
          comRes.status === "rejected"
      );
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const t = setInterval(() => setSlide((s) => (s + 1) % 3), 5200);
    return () => clearInterval(t);
  }, []);

  function onSearch(e: FormEvent) {
    e.preventDefault();
    router.push(q.trim() ? `/search?q=${encodeURIComponent(q.trim())}` : "/search");
  }

  const STAT_CARDS = community
    ? [
        {
          icon: Users2,
          tone: "bg-emerald-100 text-emerald-600",
          value: String(community.professions),
          label: "حرفي ومهني",
          href: "/search",
        },
        {
          icon: ClipboardList,
          tone: "bg-violet-100 text-violet-600",
          value: String(community.categories),
          label: "قسم",
          href: "/categories",
        },
        {
          icon: Star,
          tone: "bg-blue-100 text-blue-600",
          value: String(community.ratings),
          label: "تقييم",
          href: "/search?sort=rating",
        },
      ]
    : [];

  return (
    <div className="pb-28">
      {/* ─── الهيدر الأزرق ─────────────────────────── */}
      <header className="relative overflow-hidden bg-gradient-to-b from-brand-700 via-brand-600 to-brand-500">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/header-city.jpg"
          alt=""
          className="absolute inset-x-0 bottom-0 h-36 w-full object-cover object-top opacity-90"
        />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-brand-900/40 to-transparent" />

        <div className="relative px-4 pt-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-white/15">
                <Hammer className="size-5 text-amber-300" />
              </span>
              <div>
                <h1 className="font-display text-xl font-extrabold leading-tight text-white">
                  الدليل المهني لقرية جنزور
                </h1>
                <p className="text-[12px] font-bold text-brand-100">
                  أرقام موثوقة للحرفيين والمهنيين في منطقتك
                </p>
              </div>
            </div>
            <NotificationsBell onDark />
          </div>

          {/* البحث + أضف إعلانك */}
          <form onSubmit={onSearch} className="mt-5 flex items-center gap-2.5 pb-16">
            <div className="flex h-12 flex-1 items-center gap-2 rounded-2xl bg-white px-4 shadow-float/30 transition focus-within:ring-4 focus-within:ring-white/25">
              <Search className="size-5 shrink-0 text-brand-600" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="ابحث عن مهنة أو اسم..."
                className="h-full w-full bg-transparent text-sm font-bold text-ink outline-none placeholder:font-medium placeholder:text-ink/40"
              />
            </div>
            <Link
              href="/advertise"
              className="flex h-12 shrink-0 items-center gap-2 rounded-2xl bg-gradient-to-l from-accent-500 to-accent-600 px-4 text-sm font-extrabold text-white shadow-float/40 transition hover:brightness-105 active:scale-95"
            >
              <span className="grid size-7 place-items-center rounded-full bg-white/25">
                <Plus className="size-4.5" strokeWidth={3} />
              </span>
              أضف إعلانك
            </Link>
          </form>
        </div>

        {/* موجة فاصلة */}
        <svg
          viewBox="0 0 500 42"
          preserveAspectRatio="none"
          className="relative -mb-px block h-9 w-full"
          aria-hidden
        >
          <path
            d="M0 42h500V8c-70 22-150 26-250 14S90 2 0 22Z"
            fill="var(--color-paper)"
          />
        </svg>
      </header>

      <div className="px-4">
        {/* ─── بطاقات الإحصائيات ───────────────────── */}
        <section className="stagger -mt-1 grid grid-cols-3 gap-2.5">
          {loading || community === null
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-28 animate-pulse rounded-2xl bg-mist" />
              ))
            : STAT_CARDS.map((c) => (
                <Link
                  key={c.label}
                  href={c.href}
                  className="flex flex-col items-center rounded-2xl border border-mist bg-white p-2.5 shadow-card transition hover:shadow-float/30 active:scale-95"
                >
                  <span className={cn("grid size-9 place-items-center rounded-full", c.tone)}>
                    <c.icon className="size-4.5" />
                  </span>
                  <p className="mt-1.5 font-display text-xl font-extrabold text-brand-950">
                    {c.value}
                  </p>
                  <p className="mt-0.5 flex items-center gap-0.5 text-[10px] font-extrabold text-ink/50">
                    <ChevronLeft className="size-3" />
                    {c.label}
                  </p>
                </Link>
              ))}
        </section>

        {/* ─── البانر المتحرك ──────────────────────── */}
        <section className="relative mt-5 h-48 overflow-hidden rounded-3xl shadow-card">
          {/* شريحة 1 */}
          <div
            className={cn(
              "absolute inset-0 bg-[#101d3a] transition-opacity duration-700",
              slide === 0 ? "opacity-100" : "pointer-events-none opacity-0"
            )}
          >
            <div className="absolute left-0 top-1/2 h-40 w-40 -translate-y-1/2 overflow-hidden rounded-full bg-gradient-to-b from-accent-400 to-accent-600">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/worker-hero.png"
                alt=""
                className="h-full w-full scale-125 object-cover object-top"
              />
            </div>
            <div className="relative h-full pr-6 pt-6">
              <p className="text-sm font-extrabold text-white">مهما كان طلبك ..</p>
              <p className="mt-1 font-display text-4xl font-extrabold text-amber-400">
                هتلاقيه هنا!
              </p>
              <p className="mt-2 text-[12px] font-bold text-brand-100">
                جميع الحرفيين والمهنيين في مكان واحد
              </p>
            </div>
          </div>
          {/* شريحة 2 */}
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-l from-accent-600 to-accent-400 transition-opacity duration-700",
              slide === 1 ? "opacity-100" : "pointer-events-none opacity-0"
            )}
          >
            <div className="flex h-full flex-col justify-center pr-6">
              <p className="font-display text-3xl font-extrabold text-white">أضف إعلانك 📢</p>
              <p className="mt-2 max-w-[70%] text-[13px] font-bold leading-relaxed text-white/90">
                مساحة إعلانية بمبلغ بسيط — إعلانك يتحرك في الرئيسية أمام كل القرية
              </p>
              <Link
                href="/advertise"
                className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-extrabold text-accent-700 shadow-card transition active:scale-95"
              >
                أعلن الآن بـ 10 جنيهات
              </Link>
            </div>
          </div>
          {/* شريحة 3 */}
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-l from-brand-800 to-brand-600 transition-opacity duration-700",
              slide === 2 ? "opacity-100" : "pointer-events-none opacity-0"
            )}
          >
            <div className="flex h-full flex-col justify-center pr-6">
              <p className="font-display text-3xl font-extrabold text-white">كل خدمات جنزور</p>
              <p className="mt-2 max-w-[70%] text-[13px] font-bold leading-relaxed text-brand-100">
                أطباء وعيادات وصيدليات وحرفيين ومهن — أرقام موثوقة بعد مراجعة الإدارة
              </p>
              <Link
                href="/categories"
                className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-extrabold text-brand-700 shadow-card transition active:scale-95"
              >
                تصفح الأقسام
              </Link>
            </div>
          </div>
          {/* نقاط التنقل */}
          <div className="absolute bottom-2.5 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
            {[0, 1, 2].map((i) => (
              <button
                key={i}
                onClick={() => setSlide(i)}
                aria-label={`شريحة ${i + 1}`}
                className={cn(
                  "h-2 rounded-full transition-all",
                  slide === i ? "w-5 bg-accent-400" : "w-2 bg-white/50"
                )}
              />
            ))}
          </div>
        </section>

        {/* ─── شريط العروض (الماركيو) ─────────────── */}
        <div className="mt-5">
          <AdsMarquee />
        </div>

        {/* ─── الفلاتر السريعة ────────────────────── */}
        <section className="mt-6 flex items-start justify-between px-1">
          {QUICK.map(({ label, icon: Icon, href, active }) => (
            <Link
              key={label}
              href={href}
              className="flex flex-col items-center gap-1.5 transition active:scale-95"
            >
              <span
                className={cn(
                  "grid size-14 place-items-center rounded-full transition",
                  active ? "bg-accent-100 text-accent-600" : "bg-[#eaf0fa] text-brand-900"
                )}
              >
                <Icon className={cn("size-6", active && "fill-accent-200")} />
              </span>
              <span
                className={cn(
                  "text-[11px] font-extrabold",
                  active ? "text-accent-600" : "text-brand-950"
                )}
              >
                {label}
              </span>
              <span
                className={cn(
                  "h-1 w-9 rounded-full",
                  active ? "bg-accent-500" : "bg-transparent"
                )}
              />
            </Link>
          ))}
        </section>

        {/* ─── الأقسام الرئيسية ───────────────────── */}
        <section className="mt-5">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="flex items-center gap-2 font-display text-lg font-extrabold text-brand-950">
                <LayoutGrid className="size-5 text-accent-500" />
                الأقسام الرئيسية
              </h2>
              <span className="mt-1 block h-1 w-24 rounded-full bg-gradient-to-l from-accent-400 to-accent-600" />
            </div>
            <Link
              href="/categories"
              className="text-xs font-extrabold text-brand-600 hover:text-brand-800"
            >
              عرض الكل
            </Link>
          </div>

          {loadError && (
            <p role="status" className="mb-3 rounded-xl bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800">
              تعذر تحميل بعض البيانات الآن. يمكنك متابعة تصفح الصفحة.
            </p>
          )}

          {loading ? (
            <div className="grid grid-cols-4 gap-2.5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-28 animate-pulse rounded-2xl bg-mist" />
              ))}
            </div>
          ) : (
            <div className="stagger grid grid-cols-4 gap-2.5">
              {cats.map((c) => (
                <Link
                  key={c.id}
                  href={`/category/${c.id}`}
                  className="relative rounded-2xl border border-mist bg-white p-1.5 pb-2 shadow-card transition hover:shadow-float/30 active:scale-95"
                >
                  <span className="absolute right-2 top-2 z-10 grid min-w-5 place-items-center rounded-full bg-white/95 px-1 text-[10px] font-extrabold text-ink/60 shadow-sm">
                    {c.count}
                  </span>
                  <CategoryIcon
                    iconKey={c.iconKey}
                    seed={c.id}
                    className="h-16 w-full rounded-xl"
                    iconClassName="size-7"
                  />
                  <p className="mt-2 truncate text-center text-[11px] font-extrabold text-brand-950">
                    {c.name}
                  </p>
                  <ChevronLeft className="mx-auto mt-0.5 size-3.5 text-ink/30" />
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* ─── طوارئ 24 ساعة ──────────────────────── */}
        <section className="mt-6">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-l from-[#0b1f4b] to-brand-800 p-4 shadow-card">
            <div className="flex items-center gap-3">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-amber-400 text-[#0b1f4b]">
                <PhoneCall className="size-6" />
              </span>
              <div className="flex-1">
                <p className="flex items-center gap-1.5 font-display text-base font-extrabold text-white">
                  <Flame className="size-4.5 text-amber-400" />
                  طوارئ؟ سباك أو كهربائي؟
                </p>
                <p className="text-[11px] font-bold text-brand-100">هتلاقي اللي محتاجه في جنزور</p>
              </div>
              <Link
                href="/search?q=كهربائي"
                className="shrink-0 rounded-xl bg-white px-3.5 py-2 text-[11px] font-extrabold text-brand-800 transition active:scale-95"
              >
                كهربائي
              </Link>
              <Link
                href="/search?q=سباك"
                className="shrink-0 rounded-xl bg-amber-400 px-3.5 py-2 text-[11px] font-extrabold text-[#0b1f4b] transition active:scale-95"
              >
                سباك
              </Link>
            </div>
          </div>
          <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1">
            {EMERGENCY.map((n) => (
              <a
                key={n.num}
                href={`tel:${n.num}`}
                className="flex shrink-0 items-center gap-1.5 rounded-full border border-mist bg-white px-3.5 py-2 text-[11px] font-extrabold text-ink/70 shadow-card transition active:scale-95"
              >
                <PhoneCall className="size-3.5 text-danger" />
                {n.label}
                <span className="font-bold text-ink/40" dir="ltr">
                  {n.num}
                </span>
              </a>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
