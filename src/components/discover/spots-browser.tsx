"use client";

import { Footprints, MapPin } from "lucide-react";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { useT } from "@/components/site/locale-switch";
import { copy, fill } from "@/lib/copy";
import {
  cny,
  ENGLISH_LEVEL_META,
  SPOT_CATEGORIES,
  SPOT_META,
  SPOT_SITUATION_CATEGORIES,
  SPOT_SITUATION_META,
  SPOT_SITUATIONS,
  type EnglishLevel,
  type SpotCategory,
  type SpotSituation,
} from "@/lib/domain";
import { t } from "@/lib/locale";
import { cn } from "@/lib/utils";

export type SpotView = {
  category: SpotCategory;
  slug: string;
  name: string;
  where: string;
  walkMinutes: number;
  priceCny: number | null;
  english: EnglishLevel;
  blurb: string;
};

const ENGLISH_TONE: Readonly<Record<EnglishLevel, string>> = {
  none: "bg-primary/10 text-primary",
  some: "bg-amber-500/15 text-amber-700",
  good: "bg-jade/15 text-jade",
};

function priceLabel(priceCny: number | null, locale: "en" | "zh"): string {
  if (priceCny === null) return t(copy.noSpend, locale);
  if (priceCny === 0) return t(copy.free, locale);
  return fill(copy.perPerson, locale, { price: cny(priceCny) });
}

function categoriesFor(situation: SpotSituation | "all"): readonly SpotCategory[] {
  if (situation === "all") return SPOT_CATEGORIES;
  return SPOT_SITUATION_CATEGORIES[situation];
}

export function SpotsBrowser({ spots }: { spots: SpotView[] }) {
  const { locale, t: tr } = useT();
  const [situation, setSituation] = useState<SpotSituation | "all">("all");
  const [category, setCategory] = useState<SpotCategory | "all">("all");

  const situationCats = categoriesFor(situation);
  const inSituation = spots.filter((spot) => situationCats.includes(spot.category));
  const present = situationCats.filter((cat) => inSituation.some((spot) => spot.category === cat));
  const shown = category === "all" ? inSituation : inSituation.filter((spot) => spot.category === category);

  function pickSituation(next: SpotSituation | "all") {
    setSituation(next);
    setCategory("all");
  }

  return (
    <div className="space-y-4">
      <div role="group" aria-label={tr(copy.filterBySituation)} className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <SituationChip active={situation === "all"} onClick={() => pickSituation("all")}>
          {tr(copy.all)} <span className="tabular-nums opacity-70">{spots.length}</span>
        </SituationChip>
        {SPOT_SITUATIONS.map((id) => {
          const count = spots.filter((spot) => SPOT_SITUATION_CATEGORIES[id].includes(spot.category)).length;
          return (
            <SituationChip key={id} active={situation === id} onClick={() => pickSituation(id)} disabled={count === 0}>
              {t(SPOT_SITUATION_META[id], locale)}{" "}
              <span className="tabular-nums opacity-70">{count}</span>
            </SituationChip>
          );
        })}
      </div>

      <div role="group" aria-label={tr(copy.filterByCategory)} className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
        <FilterChip active={category === "all"} onClick={() => setCategory("all")}>
          {tr(copy.all)} <span className="tabular-nums opacity-70">{inSituation.length}</span>
        </FilterChip>
        {present.map((cat) => {
          const meta = SPOT_META[cat];
          const count = inSituation.filter((spot) => spot.category === cat).length;
          return (
            <FilterChip key={cat} active={category === cat} onClick={() => setCategory(cat)}>
              <span aria-hidden>{meta.emoji}</span> {t(meta, locale)}{" "}
              <span className="tabular-nums opacity-70">{count}</span>
            </FilterChip>
          );
        })}
      </div>

      {shown.length === 0 ? (
        <p className="rounded-2xl border border-dashed bg-card px-4 py-8 text-center text-sm text-muted-foreground">
          {tr(copy.noSpotsHere)}
        </p>
      ) : (
        <ul key={`${situation}-${category}`} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((spot, index) => {
            const meta = SPOT_META[spot.category];
            const english = ENGLISH_LEVEL_META[spot.english];
            return (
              <li
                key={`${spot.category}-${spot.slug}`}
                className="animate-rise-in flex flex-col rounded-2xl border bg-card p-4 transition-shadow hover:shadow-md"
                style={{ animationDelay: `${Math.min(index, 11) * 40}ms` }}
              >
                <div className="flex items-start gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary text-xl" aria-hidden>
                    {meta.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground">{t(meta, locale)}</p>
                    <p className="font-medium leading-snug">
                      <Link href={`/place/${spot.slug}`} className="hover:underline">
                        {spot.name}
                      </Link>
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-relaxed">{spot.blurb}</p>
                <dl className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
                  <div className="inline-flex items-center gap-1">
                    <MapPin className="size-3.5" aria-hidden />
                    <dt className="sr-only">{tr(copy.location)}</dt>
                    <dd>{spot.where}</dd>
                  </div>
                  <div className="inline-flex items-center gap-1 tabular-nums">
                    <Footprints className="size-3.5" aria-hidden />
                    <dt className="sr-only">{tr(copy.walk)}</dt>
                    <dd>{fill(copy.walkMinutes, locale, { n: spot.walkMinutes })}</dd>
                  </div>
                  <div className="tabular-nums">
                    <dt className="sr-only">{tr(copy.price)}</dt>
                    <dd>{priceLabel(spot.priceCny, locale)}</dd>
                  </div>
                  <div className="ml-auto">
                    <dt className="sr-only">{tr(copy.englishOk)}</dt>
                    <dd className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", ENGLISH_TONE[spot.english])}>
                      {t(english, locale)}
                    </dd>
                  </div>
                </dl>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function SituationChip({
  active,
  onClick,
  disabled,
  children,
}: {
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "rounded-2xl border px-3 py-2.5 text-left text-sm font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-40",
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-card hover:border-foreground/40",
      )}
    >
      {children}
    </button>
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
