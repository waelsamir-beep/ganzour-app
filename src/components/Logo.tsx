import { cn } from "@/lib/utils";

/** شعار التطبيق: درع أزرق يحتضن دبوس موقع برتقالي بداخله بيت القرية */
export function LogoMark({ className, size = 48 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={cn("drop-shadow-sm", className)}
      aria-hidden
    >
      <defs>
        <linearGradient id="gpz-shield" x1="8" y1="4" x2="56" y2="60" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3b76f3" />
          <stop offset="1" stopColor="#172554" />
        </linearGradient>
        <linearGradient id="gpz-glow" x1="20" y1="12" x2="44" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffdcaa" />
          <stop offset="1" stopColor="#fd7f10" />
        </linearGradient>
      </defs>
      {/* الدرع */}
      <rect x="4" y="4" width="56" height="56" rx="18" fill="url(#gpz-shield)" />
      <rect x="6.5" y="6.5" width="51" height="51" rx="16" stroke="#94bffb" strokeOpacity="0.35" strokeWidth="1.5" />
      {/* دبوس الموقع */}
      <path
        d="M32 12c-8.3 0-14.5 6.1-14.5 14.1 0 5.3 3.1 9.9 6.6 13.7 2.5 2.7 5 4.9 6.5 6.2a2.1 2.1 0 0 0 2.8 0c1.5-1.3 4-3.5 6.5-6.2 3.5-3.8 6.6-8.4 6.6-13.7C46.5 18.1 40.3 12 32 12Z"
        fill="url(#gpz-glow)"
      />
      {/* بيت القرية داخل الدبوس */}
      <path
        d="M32 19.5 24.5 26v7.5a1.5 1.5 0 0 0 1.5 1.5h4.5v-5.5h3v5.5h4.5a1.5 1.5 0 0 0 1.5-1.5V26L32 19.5Z"
        fill="#172554"
      />
      {/* نقطة الدليل */}
      <circle cx="32" cy="49.5" r="2.4" fill="#ff9d3a" />
    </svg>
  );
}

export function LogoStack({
  title = "الدليل المهني",
  subtitle = "جنزور",
  tagline,
  markSize = 72,
  className,
}: {
  title?: string;
  subtitle?: string;
  tagline?: string;
  markSize?: number;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center text-center", className)}>
      <LogoMark size={markSize} />
      <h1 className="mt-4 font-display text-2xl font-extrabold leading-tight text-brand-900">
        {title}
      </h1>
      <p className="font-display text-lg font-bold text-brand-600">{subtitle}</p>
      {tagline ? <p className="mt-2 text-sm text-ink/60">{tagline}</p> : null}
    </div>
  );
}
