import Link from "next/link";
import type { ReactNode } from "react";
import { CardArt } from "@/components/art/card-art";
import { cny } from "@/lib/domain";
import type { DiscoverItem } from "./discover-cards";
import { ScorePill } from "./score-pill";

export function DiscoverCard({ item, index = 0 }: { item: DiscoverItem; index?: number }) {
  const heading =
    item.kind === "city" ? (
      <h3 className="text-2xl font-semibold tracking-tight sm:text-[1.7rem]">
        {item.name}
        <span className="ml-2 text-base font-normal text-white/75">{item.nameEn}</span>
      </h3>
    ) : (
      <>
        <p className="text-xs text-white/70">
          {item.city} · {item.cityEn}
        </p>
        <h3 className="text-xl font-semibold leading-tight tracking-tight sm:text-[1.35rem]">
          {item.university}
          <span className="ml-1.5 font-medium text-white/85">{item.campusName}</span>
        </h3>
        <p className="text-xs text-white/70">
          {item.universityEn} · {item.campusNameEn}
        </p>
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
          <ScorePill score={item.score} />
        </div>

        <div className="mt-auto space-y-1 drop-shadow-sm">
          {heading}
          <p className="line-clamp-2 text-sm leading-snug text-white/85">{item.tagline}</p>
          <p className="line-clamp-1 text-xs text-white/65">{item.taglineEn}</p>
        </div>

        <dl className="mt-3 grid grid-cols-2 gap-1.5">
          <Cell label="月预算" value={`${cny(item.frugal)} 起`} hint={`舒适 ${cny(item.comfortable)}`} />
          {item.kind === "city" ? (
            <Cell label="校区" value={`${item.campusCount} 个`} hint="已收录" />
          ) : (
            <Cell
              label="国际生"
              value={item.internationalStudents.toLocaleString("zh-CN")}
              hint={`${item.countries} 个国家`}
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
