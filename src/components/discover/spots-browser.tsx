"use client";

import { Footprints, MapPin } from "lucide-react";
import { useState, type ReactNode } from "react";
import {
  cny,
  ENGLISH_LEVEL_META,
  SPOT_CATEGORIES,
  SPOT_META,
  type EnglishLevel,
  type Spot,
  type SpotCategory,
} from "@/lib/domain";
import { cn } from "@/lib/utils";

const ENGLISH_TONE: Readonly<Record<EnglishLevel, string>> = {
  none: "bg-primary/10 text-primary",
  some: "bg-amber-500/15 text-amber-700",
  good: "bg-jade/15 text-jade",
};

function price(priceCny: number | null): string {
  if (priceCny === null) return "不花钱";
  if (priceCny === 0) return "免费";
  return `人均 ${cny(priceCny)}`;
}

export function SpotsBrowser({ spots }: { spots: Spot[] }) {
  const [category, setCategory] = useState<SpotCategory | "all">("all");
  const present = SPOT_CATEGORIES.filter((cat) => spots.some((spot) => spot.category === cat));
  const shown = category === "all" ? spots : spots.filter((spot) => spot.category === category);

  return (
    <div className="space-y-4">
      <div role="group" aria-label="按类别筛选" className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
        <FilterChip active={category === "all"} onClick={() => setCategory("all")}>
          全部 <span className="tabular-nums opacity-70">{spots.length}</span>
        </FilterChip>
        {present.map((cat) => {
          const meta = SPOT_META[cat];
          const count = spots.filter((spot) => spot.category === cat).length;
          return (
            <FilterChip key={cat} active={category === cat} onClick={() => setCategory(cat)}>
              <span aria-hidden>{meta.emoji}</span> {meta.zh}{" "}
              <span className="tabular-nums opacity-70">{count}</span>
            </FilterChip>
          );
        })}
      </div>

      <ul key={category} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((spot, index) => {
          const meta = SPOT_META[spot.category];
          const english = ENGLISH_LEVEL_META[spot.english];
          return (
            <li
              key={`${spot.category}-${spot.name}`}
              className="animate-rise-in flex flex-col rounded-2xl border bg-card p-4 transition-shadow hover:shadow-md"
              style={{ animationDelay: `${Math.min(index, 11) * 40}ms` }}
            >
              <div className="flex items-start gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary text-xl" aria-hidden>
                  {meta.emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">
                    {meta.zh} · {meta.en}
                  </p>
                  <p className="font-medium leading-snug">{spot.name}</p>
                  <p className="text-xs text-muted-foreground">{spot.nameEn}</p>
                </div>
              </div>
              <p className="mt-3 text-sm leading-relaxed">{spot.blurb}</p>
              <dl className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
                <div className="inline-flex items-center gap-1">
                  <MapPin className="size-3.5" aria-hidden />
                  <dt className="sr-only">位置</dt>
                  <dd>{spot.where}</dd>
                </div>
                <div className="inline-flex items-center gap-1 tabular-nums">
                  <Footprints className="size-3.5" aria-hidden />
                  <dt className="sr-only">步行</dt>
                  <dd>步行 {spot.walkMinutes} 分钟</dd>
                </div>
                <div className="tabular-nums">
                  <dt className="sr-only">价格</dt>
                  <dd>{price(spot.priceCny)}</dd>
                </div>
                <div className="ml-auto">
                  <dt className="sr-only">英语</dt>
                  <dd
                    className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", ENGLISH_TONE[spot.english])}
                    title={english.en}
                  >
                    {english.zh}
                  </dd>
                </div>
              </dl>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full border px-3 py-1 text-sm transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-card hover:border-foreground/40",
      )}
    >
      {children}
    </button>
  );
}
