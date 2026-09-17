import { ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArtHero, HeroStat } from "@/components/discover/art-hero";
import { ClimateStrip } from "@/components/discover/climate-strip";
import { DiscoverCard } from "@/components/discover/discover-card";
import { campusItem } from "@/components/discover/discover-cards";
import { PlaceBlock } from "@/components/discover/place-block";
import { ScoreBars } from "@/components/discover/score-bars";
import { Notice, Section } from "@/components/discover/section";
import { SectionNav } from "@/components/discover/section-nav";
import { ScorePill } from "@/components/discover/score-pill";
import { TransportTable } from "@/components/discover/transport-table";
import { CampusSocial } from "@/components/social/campus-social";
import { NANJING_VISA_HALLS, campusesOfCity, getCity, requirePlace } from "@/data";
import { copy, fill } from "@/lib/copy";
import { cny, overallScore, usd } from "@/lib/domain";
import { t } from "@/lib/locale";
import { readLocale } from "@/lib/read-locale";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await readLocale();
  const { slug } = await params;
  const city = getCity(slug);
  if (!city) return {};
  return { title: t(city.name, locale), description: t(city.tagline, locale) };
}

export default async function CityPage({ params }: Props) {
  const locale = await readLocale();
  const { slug } = await params;
  const city = getCity(slug);
  if (!city) notFound();

  const campuses = campusesOfCity(city.slug);
  const campusCards = campuses.map((campus) => campusItem(campus, city, locale));
  const name = t(city.name, locale);

  const nav = [
    { id: "scores", label: t(copy.scores, locale) },
    { id: "highlights", label: t(copy.highlights, locale) },
    { id: "climate", label: t(copy.climate, locale) },
    { id: "visa", label: t(copy.visa, locale) },
    { id: "arrivals", label: t(copy.arrivals, locale) },
    { id: "campuses", label: t(copy.campuses, locale) },
    { id: "social", label: t(copy.community, locale) },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-12 px-4 pt-6 pb-24 sm:px-6">
      <ArtHero art={city.art}>
        <div className="flex flex-col gap-8 p-6 sm:p-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <nav aria-label={t(copy.breadcrumb, locale)} className="flex items-center gap-1 text-xs text-white/75">
              <Link href="/" className="hover:text-white hover:underline">
                {t(copy.home, locale)}
              </Link>
              <ChevronRight className="size-3" aria-hidden />
              <span className="text-white">{name}</span>
            </nav>
            <h1 className="mt-4 flex flex-wrap items-baseline gap-x-3 text-5xl font-semibold tracking-tight sm:text-6xl">
              {name}
              <span className="text-xl font-normal text-white/80 sm:text-2xl">{city.pinyin}</span>
            </h1>
            <p className="mt-1 text-sm text-white/80">{t(city.province, locale)}</p>
            <p className="mt-5 text-lg leading-snug sm:text-xl">{t(city.tagline, locale)}</p>
          </div>

          <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:w-[26rem] lg:shrink-0">
            <HeroStat
              label={t(copy.overall, locale)}
              value={<ScorePill score={overallScore(city.scores)} size="lg" locale={locale} className="shadow-none" />}
              hint={t(copy.overallHint, locale)}
            />
            <HeroStat
              label={t(copy.monthlyBudget, locale)}
              value={`${cny(city.budget.frugal)} ${t(copy.fromBudget, locale)}`}
              hint={`${t(copy.comfortable, locale)} ${cny(city.budget.comfortable)} · ${usd(city.budget.comfortable)}`}
            />
            <HeroStat
              label={t(copy.campuses, locale)}
              value={fill(copy.listedCampusesCount, locale, { n: campuses.length })}
              hint={t(copy.listedCampuses, locale)}
            />
            <HeroStat
              label={t(copy.population, locale)}
              value={`${city.populationMillions} ${t(copy.millions, locale)}`}
            />
            <HeroStat
              label={t(copy.metro, locale)}
              value={`${city.metroLines} ${t(copy.metroLines, locale)}`}
            />
            <HeroStat
              label={t(copy.julJan, locale)}
              value={`${city.climate[6].highC}° / ${city.climate[0].lowC}°`}
              hint={t(copy.julJanHint, locale)}
            />
          </dl>
        </div>
      </ArtHero>

      <Notice>{t(copy.noticeCity, locale)}</Notice>

      <SectionNav items={nav} />

      <Section id="scores" title={t(copy.scores, locale)} lead={t(copy.scoresLead, locale)}>
        <ScoreBars scores={city.scores} locale={locale} />
      </Section>

      <Section id="highlights" title={t(copy.highlights, locale)}>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <p className="text-base leading-relaxed text-foreground/90">{t(city.summary, locale)}</p>
          <ul className="space-y-2">
            {city.highlights.map((highlight) => (
              <li key={highlight.zh} className="flex gap-2.5 rounded-xl border bg-card px-3.5 py-2.5 text-sm">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                <span>{t(highlight, locale)}</span>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section id="climate" title={t(copy.climate, locale)} lead={t(copy.climateLead, locale)}>
        <ClimateStrip climate={city.climate} locale={locale} />
      </Section>

      <Section id="visa" title={t(copy.visa, locale)} lead={t(copy.visaLead, locale)}>
        <div className="grid gap-4 lg:grid-cols-2">
          {NANJING_VISA_HALLS.map((hall) => (
            <PlaceBlock key={hall} place={requirePlace(hall)} locale={locale} />
          ))}
        </div>
      </Section>

      <Section id="arrivals" title={t(copy.arrivals, locale)} lead={t(copy.arrivalsLead, locale)}>
        <TransportTable legs={city.arrivals} locale={locale} className="max-w-3xl" />
      </Section>

      <Section
        id="campuses"
        title={fill(copy.cityCampuses, locale, { name })}
        lead={t(copy.cityCampusesLead, locale)}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {campusCards.map((card, index) => (
            <DiscoverCard key={card.slug} item={card} index={index} />
          ))}
        </div>
      </Section>

      <div id="social" className="scroll-mt-32">
        <CampusSocial room={{ kind: "city", city: city.slug }} locale={locale} />
      </div>
    </div>
  );
}
