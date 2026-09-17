"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { CardArt } from "@/components/art/card-art";
import { useT } from "@/components/site/locale-switch";
import { copy, fill } from "@/lib/copy";
import { cny } from "@/lib/domain";
import { localeNumber } from "@/lib/locale";
import type { DiscoverItem } from "./discover-cards";
import { ScorePill } from "./score-pill";

export function DiscoverCard({ item, index = 0 }: { item: DiscoverItem; index?: number }) {
  const { locale, t } = useT();
  const heading =
    item.kind === "city" ? (
      <h3 className="text-2xl font-semibold tracking-tight sm:text-[1.7rem]">{item.name}</h3>
    ) : (
      <>
        <p className="text-xs text-white/70">{item.city}</p>
        <h3 className="text-xl font-semibold leading-tight tracking-tight sm:text-[1.35rem]">
          {item.university}
          <span className="ml-1.5 font-medium text-white/85">{item.campusName}</span>
        </h3>
      </>
    );

  return (
    <Link
      href={item.href}
      style={{ animationDelay: `${Math.min(index, 11) * 45}ms` }}
      className="group animate-rise-in relative block aspect-[4/3] overflow-hidden rounded-2xl shadow-md ring-1 ring-black/10 transition-all duration-300 outline-none hover:-translate-y-1 hover:shadow-2xl focus-visible:ring-3 focus-visible:ring-ring sm:aspect-[4/5] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      <CardArt art={item.art} className="transition-[filter] duration-500 group-hover:brightness-110" />

      <div className="relative flex h-full flex-col p-4 text-white">
        <div className="flex items-start justify-between gap-2">
          <span className="rounded-full bg-stone-950/40 px-2 py-0.5 text-[11px] text-white/90 backdrop-blur-sm">
            {item.kind === "city" ? item.province : item.city}
          </span>
          <ScorePill score={item.score} locale={locale} />
        </div>

        <div className="mt-auto space-y-1 drop-shadow-sm">
          {heading}
          <p className="line-clamp-2 text-sm leading-snug text-white/85">{item.tagline}</p>
        </div>

        <dl className="mt-3 grid grid-cols-2 gap-1.5">
          <Cell label={t(copy.monthlyBudget)} value={`${cny(item.frugal)} ${t(copy.fromBudget)}`} hint={`${t(copy.comfortable)} ${cny(item.comfortable)}`} />
          {item.kind === "city" ? (
            <Cell label={t(copy.campuses)} value={fill(copy.listedCampusesCount, locale, { n: item.campusCount })} hint={t(copy.listedCampuses)} />
          ) : (
            <Cell
              label={t(copy.intlStudents)}
              value={item.internationalStudents.toLocaleString(localeNumber(locale))}
              hint={fill(copy.intlFrom, locale, { n: item.countries })}
            />
          )}
        </dl>
      </div>
    </Link>
  );
}

function Cell({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <div className="min-w-0 rounded-lg bg-white/10 px-2 py-1.5 ring-1 ring-white/10 backdrop-blur-sm transition-colors group-hover:bg-white/15">
      <dt className="text-[10px] text-white/65">{label}</dt>
      <dd className="truncate text-sm font-semibold tabular-nums">{value}</dd>
      {hint ? <dd className="truncate text-[10px] text-white/60">{hint}</dd> : null}
    </div>
  );
}
