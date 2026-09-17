import type { ReactNode } from "react";
import { CardArt } from "@/components/art/card-art";
import type { CardArt as CardArtData } from "@/lib/domain";
import { cn } from "@/lib/utils";

export function ArtHero({
  art,
  className,
  children,
}: {
  art: CardArtData;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "animate-rise-in relative overflow-hidden rounded-3xl text-white shadow-xl ring-1 ring-black/10",
        className,
      )}
    >
      <CardArt art={art} interactive={false} />
      <div className="absolute inset-0 bg-stone-950/25" aria-hidden />
      <div className="relative">{children}</div>
    </div>
  );
}

export function HeroStat({
  label,
  value,
  hint,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
}) {
  return (
    <div className="min-w-0 rounded-xl bg-white/12 px-3 py-2.5 ring-1 ring-white/15 backdrop-blur-sm">
      <dt className="text-[11px] text-white/75">{label}</dt>
      <dd className="mt-0.5 text-base font-semibold tabular-nums tracking-tight sm:text-lg">{value}</dd>
      {hint ? <dd className="text-[11px] text-white/70">{hint}</dd> : null}
    </div>
  );
}
