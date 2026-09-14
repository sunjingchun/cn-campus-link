import { ChevronRight, Info } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArtHero, HeroStat } from "@/components/discover/art-hero";
import { ClimateStrip } from "@/components/discover/climate-strip";
import { DiscoverCard } from "@/components/discover/discover-card";
import { campusItem } from "@/components/discover/discover-cards";
import { PlaceBlock } from "@/components/discover/place-block";
import { ScoreBars } from "@/components/discover/score-bars";
import { Section } from "@/components/discover/section";
import { SectionNav } from "@/components/discover/section-nav";
import { ScorePill } from "@/components/discover/stat";
import { TransportTable } from "@/components/discover/transport-table";
import { CampusSocial } from "@/components/social/campus-social";
import { campusesOfCity, getCity } from "@/data";
import { cny, overallScore, usd } from "@/lib/domain";
import { countMembersByCampus } from "@/lib/store";

type Props = { params: Promise<{ slug: string }> };

const NAV = [
  { id: "scores", label: "评分" },
  { id: "highlights", label: "亮点" },
  { id: "climate", label: "气候" },
  { id: "visa", label: "出入境" },
  { id: "arrivals", label: "抵达" },
  { id: "campuses", label: "校区" },
  { id: "social", label: "社区" },
];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const city = getCity(slug);
  if (!city) return {};
  return { title: `${city.name} ${city.nameEn}`, description: city.tagline };
}

export default async function CityPage({ params }: Props) {
  const { slug } = await params;
  const city = getCity(slug);
  if (!city) notFound();

  const campuses = campusesOfCity(city.slug);
  const membersByCampus = countMembersByCampus();
  const campusCards = campuses.map((campus) =>
    campusItem(campus, city, membersByCampus.get(campus.slug) ?? 0),
  );
  const members = campusCards.reduce((sum, card) => sum + card.members, 0);

  return (
    <div className="mx-auto max-w-7xl space-y-12 px-4 pt-6 pb-24 sm:px-6">
      <ArtHero art={city.art}>
        <div className="flex flex-col gap-8 p-6 sm:p-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <nav aria-label="面包屑" className="flex items-center gap-1 text-xs text-white/75">
              <Link href="/" className="hover:text-white hover:underline">
                首页
              </Link>
              <ChevronRight className="size-3" aria-hidden />
              <span className="text-white">{city.name}</span>
            </nav>
            <h1 className="mt-4 flex flex-wrap items-baseline gap-x-3 text-5xl font-semibold tracking-tight sm:text-6xl">
              {city.name}
              <span className="text-xl font-normal text-white/80 sm:text-2xl">{city.pinyin}</span>
            </h1>
            <p className="mt-1 text-sm text-white/80">
              {city.nameEn} · {city.province}
            </p>
            <p className="mt-5 text-lg leading-snug sm:text-xl">{city.tagline}</p>
            <p className="mt-1 text-sm text-white/75">{city.taglineEn}</p>
          </div>

          <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:w-[26rem] lg:shrink-0">
            <HeroStat
              label="综合评分"
              en="Overall"
              value={<ScorePill score={overallScore(city.scores)} size="lg" className="shadow-none" />}
              hint="十项平均，满分 100"
            />
            <HeroStat
              label="月预算"
              en="Monthly"
              value={`${cny(city.budget.frugal)} 起`}
              hint={`舒适 ${cny(city.budget.comfortable)} · ${usd(city.budget.comfortable)}`}
            />
            <HeroStat label="校区" en="Campuses" value={`${campuses.length} 个`} hint={`成员 ${members} 人`} />
            <HeroStat label="人口" en="Population" value={`${city.populationMillions} 百万`} />
            <HeroStat label="地铁" en="Metro" value={`${city.metroLines} 条线`} />
            <HeroStat
              label="夏天 / 冬天"
              en="Jul / Jan"
              value={`${city.climate[6].highC}° / ${city.climate[0].lowC}°`}
              hint="月均最高 / 最低"
            />
          </dl>
        </div>
      </ArtHero>

      <p className="flex items-start gap-2 rounded-xl border border-dashed bg-card/60 px-4 py-2.5 text-xs leading-relaxed text-muted-foreground">
        <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
        <span>
          内容由在读学生维护，政策、价格和办公时间都会变。涉及签证、居留许可的事，行动前请再向学校国际处或出入境管理局确认一次。
          Community-maintained; reconfirm anything visa-related with your international office.
        </span>
      </p>

      <SectionNav items={NAV} />

      <Section id="scores" title="十项评分" en="Scores" lead="1 分很差，5 分很好。悬停或看小字了解每项的口径。">
        <ScoreBars scores={city.scores} />
      </Section>

      <Section id="highlights" title="亮点与提醒" en="Highlights">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <p className="text-base leading-relaxed text-foreground/90">{city.summary}</p>
          <ul className="space-y-2">
            {city.highlights.map((highlight) => (
              <li key={highlight} className="flex gap-2.5 rounded-xl border bg-card px-3.5 py-2.5 text-sm">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section id="climate" title="十二个月的天气" en="Climate" lead="决定你要不要带羽绒服，以及夏天会不会想逃。">
        <ClimateStrip climate={city.climate} />
      </Section>

      <Section
        id="visa"
        title="出入境管理局"
        en="Exit-Entry Administration"
        lead="办居留许可、续签、换护照加注都在这里。复制中文地址直接给司机看。"
      >
        <PlaceBlock place={city.visaOffice} className="max-w-2xl" />
      </Section>

      <Section id="arrivals" title="抵达与往返" en="Getting in and out" lead="机场、高铁站到市区，以及去邻近城市的时间和价格。">
        <TransportTable legs={city.arrivals} className="max-w-3xl" />
      </Section>

      <Section
        id="campuses"
        title={`${city.name}的校区`}
        en="Campuses"
        lead="每个校区都有自己的落地清单、周边和住哪儿。"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {campusCards.map((card, index) => (
            <DiscoverCard key={card.slug} item={card} index={index} />
          ))}
        </div>
      </Section>

      <div id="social" className="scroll-mt-32">
        <CampusSocial room={{ kind: "city", city: city.slug }} />
      </div>
    </div>
  );
}
