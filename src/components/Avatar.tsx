import { UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { CategoryGlyph } from "./CategoryIcon";

const PALETTE = [
  "from-brand-500 to-brand-800",
  "from-sea-400 to-sea-600",
  "from-violet-500 to-purple-700",
  "from-fuchsia-500 to-purple-600",
  "from-rose-500 to-pink-600",
  "from-emerald-500 to-brand-700",
  "from-cyan-500 to-blue-700",
];

function hashOf(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

/** بلاطة بصرية لصاحب الخدمة: صورة إن وُجدت، وإلا أيقونة القسم على تدرج لوني */
export function Avatar({
  name,
  imageUrl,
  iconKey,
  className,
}: {
  name: string;
  imageUrl?: string | null;
  iconKey?: string;
  className?: string;
}) {
  if (imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={imageUrl} alt={name} className={cn("object-cover", className)} />
    );
  }
  const tone = PALETTE[hashOf(name) % PALETTE.length];
  return (
    <div
      className={cn(
        "grid place-items-center bg-gradient-to-br text-white",
        tone,
        className
      )}
      aria-hidden
    >
      {iconKey ? (
        <CategoryGlyph iconKey={iconKey} className="size-[52%]" />
      ) : (
        <UserRound className="size-[52%]" strokeWidth={2.2} />
      )}
    </div>
  );
}
