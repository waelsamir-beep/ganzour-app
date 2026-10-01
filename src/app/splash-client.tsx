"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogoMark } from "@/components/Logo";

export function SplashScreen({ isAdmin }: { isAdmin: boolean }) {
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => {
      router.replace(isAdmin ? "/admin" : "/home");
    }, 2300);
    return () => clearTimeout(t);
  }, [isAdmin, router]);

  return (
    <div className="grid min-h-dvh place-items-center bg-gradient-to-b from-brand-950 via-brand-900 to-brand-800 px-6">
      <div className="flex flex-col items-center text-center">
        <div className="relative">
          <span className="absolute inset-0 rounded-[28px] bg-brand-400/30 [animation:splash-ring_1.6s_ease-out_infinite]" />
          <LogoMark size={104} className="animate-splash-pop relative" />
        </div>
        <h1 className="mt-6 animate-fade-up font-display text-3xl font-extrabold text-white [animation-delay:0.35s]">
          الدليل المهني
        </h1>
        <p className="mt-1 animate-fade-up font-display text-xl font-bold text-brand-300 [animation-delay:0.5s]">
          لقرية جنزور
        </p>
        <p className="mt-4 animate-fade-up text-sm font-medium text-brand-200/80 [animation-delay:0.65s]">
          كل خدمات قريتك في مكان واحد
        </p>
        <div className="mt-10 flex gap-1.5">
          <span className="size-2 rounded-full bg-brand-300 animate-pulse-dot" />
          <span className="size-2 rounded-full bg-brand-300 animate-pulse-dot [animation-delay:0.3s]" />
          <span className="size-2 rounded-full bg-brand-300 animate-pulse-dot [animation-delay:0.6s]" />
        </div>
      </div>
    </div>
  );
}
