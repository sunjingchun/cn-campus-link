import { ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { ArtHero, HeroStat } from "@/components/discover/art-hero";
import { ClimateStrip } from "@/components/discover/climate-strip";
import { Faq } from "@/components/discover/faq";
import { LandingChecklist } from "@/components/discover/landing-checklist";
import { BudgetTiers, CostGrid } from "@/components/discover/money";
import { Neighborhoods } from "@/components/discover/neighborhoods";
import { ProsCons } from "@/components/discover/pros-cons";
import { QuickFacts } from "@/components/discover/quick-facts";
import { ScoreBars } from "@/components/discover/score-bars";
import { Notice, Section } from "@/components/discover/section";
import { SectionNav } from "@/components/discover/section-nav";
import { type SpotView, SpotsBrowser } from "@/components/discover/spots-browser";
import { CampusOrientation } from "@/components/discover/campus-orientation";
import { ScorePill } from "@/components/discover/score-pill";
import { TransportTable } from "@/components/discover/transport-table";
import { CampusSocial } from "@/components/social/campus-social";
import { campusLabel, cityOfCampus, getCampus, requirePlace } from "@/data";
import { copy, fill } from "@/lib/copy";
import { cny, CNY_PER_USD, LANDING_STEPS, overallScore, usd } from "@/lib/domain";
import { ANON_RE, ANON_COOKIE } from "@/lib/events";
import { localeNumber, t } from "@/lib/locale";
import { listMyMarks, listStepCounts } from "@/lib/marks";
import { readLocale } from "@/lib/read-locale";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await readLocale();
  const { slug } = await params;
  const campus = getCampus(slug);
  if (!campus) return {};
  return { title: campusLabel(campus, locale), description: t(campus.tagline, locale) };
}

export default async function CampusPage({ params }: Props) {
  const locale = await readLocale();
  const { slug } = await params;
  const campus = getCampus(slug);
  const city = campus ? cityOfCampus(campus.slug) : undefined;
  if (!campus || !city) notFound();

  const anonId = (await cookies()).get(ANON_COOKIE)?.value ?? "";
  const initialMine = ANON_RE.test(anonId) ? listMyMarks(anonId, campus.slug) : [];
  const initialCounts = listStepCounts(campus.slug);

  const { facts } = campus;
  const score = overallScore(campus.scores);
  const spots: SpotView[] = campus.spots.map((spot) => {
    const place = requirePlace(spot.place);
    return {
      category: spot.category,
      slug: place.slug,
      name: t(place.name, locale),
      where: t(spot.where, locale),
      walkMinutes: spot.walkMinutes,
      priceCny: spot.priceCny,
      english: spot.english,
      blurb: t(spot.blurb, locale),
    };
  });

  const nav = [
    { id: "facts", label: t(copy.facts, locale) },
    { id: "scores", label: t(copy.scores, locale) },
    { id: "money", label: t(copy.money, locale) },
    { id: "landing", label: t(copy.landing, locale) },
    ...(campus.orientation ? [{ id: "orientation", label: t(copy.orientation, locale) }] : []),
    { id: "spots", label: t(copy.spots, locale) },
    { id: "neighborhoods", label: t(copy.neighborhoods, locale) },
    { id: "transport", label: t(copy.transport, locale) },
    { id: "climate", label: t(copy.climate, locale) },
    { id: "verdict", label: t(copy.verdict, locale) },
    { id: "faq", label: t(copy.faq, locale) },
    { id: "social", label: t(copy.community, locale) },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-12 px-4 pt-6 pb-24 sm:px-6">
      <ArtHero art={campus.art}>
        <div className="flex flex-col gap-8 p-6 sm:p-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <nav aria-label={t(copy.breadcrumb, locale)} className="flex flex-wrap items-center gap-1 text-xs text-white/75">
              <Link href="/" className="hover:text-white hover:underline">
                {t(copy.home, locale)}
              </Link>
              <ChevronRight className="size-3" aria-hidden />
              <Link href={`/city/${city.slug}`} className="hover:text-white hover:underline">
                {t(city.name, locale)}
              </Link>
              <ChevronRight className="size-3" aria-hidden />
              <span className="text-white">{t(facts.university, locale)}</span>
            </nav>
            <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
              {t(facts.university, locale)}
              <span className="ml-2 font-medium text-white/85">{t(facts.campusName, locale)}</span>
            </h1>
            <p className="mt-5 text-lg leading-snug sm:text-xl">{t(campus.tagline, locale)}</p>
          </div>

          <dl className="grid grid-cols-2 gap-2 lg:w-[22rem] lg:shrink-0">
            <HeroStat
              label={t(copy.overall, locale)}
              value={<ScorePill score={score} size="lg" locale={locale} className="shadow-none" />}
              hint={t(copy.overallHint, locale)}
            />
            <HeroStat
              label={t(copy.monthlyBudget, locale)}
              value={`${cny(campus.budget.frugal)} ${t(copy.fromBudget, locale)}`}
              hint={`${t(copy.comfortable, locale)} ${cny(campus.budget.comfortable)} · ${usd(campus.budget.comfortable)}`}
            />
            <HeroStat
              label={t(copy.intlStudents, locale)}
              value={facts.internationalStudents.toLocaleString(localeNumber(locale))}
              hint={facts.statNote ? t(facts.statNote, locale) : fill(copy.intlFrom, locale, { n: facts.countries })}
            />
          </dl>
        </div>
      </ArtHero>

      <Notice>{t(copy.noticeCampus, locale)}</Notice>

      <SectionNav items={nav} />

      <Section id="facts" title={t(copy.facts, locale)}>
        <p className="mb-5 max-w-3xl text-base leading-relaxed text-foreground/90">{t(campus.summary, locale)}</p>
        <QuickFacts facts={facts} locale={locale} />
      </Section>

      <Section id="scores" title={t(copy.scores, locale)} lead={t(copy.scoresLead, locale)}>
        <ScoreBars scores={campus.scores} locale={locale} />
      </Section>

      <Section
        id="money"
        title={t(copy.money, locale)}
        lead={t(copy.moneyLead, locale).replace("1:7.1", `1:${CNY_PER_USD}`)}
      >
        <BudgetTiers budget={campus.budget} locale={locale} />
        <CostGrid costs={campus.costs} locale={locale} className="mt-4" />
      </Section>

      <Section
        id="landing"
        title={t(copy.landing, locale)}
        lead={t(copy.landingLead, locale).replace("9", String(LANDING_STEPS.length))}
      >
        <LandingChecklist
          landing={campus.landing}
          locale={locale}
          campusSlug={campus.slug}
          initialMine={initialMine}
          initialCounts={initialCounts}
        />
      </Section>

      {campus.orientation ? (
        <Section id="orientation" title={t(copy.orientation, locale)} lead={t(copy.orientationLead, locale)}>
          <CampusOrientation
            orientation={campus.orientation}
            campusLabel={t(facts.campusName, locale)}
            locale={locale}
          />
        </Section>
      ) : null}

      <Section id="spots" title={t(copy.spots, locale)} lead={t(copy.spotsLead, locale)}>
        <SpotsBrowser spots={spots} />
      </Section>

      <Section
        id="neighborhoods"
        title={t(copy.neighborhoods, locale)}
        lead={t(facts.offCampusAllowed ? copy.neighborhoodsLead : copy.neighborhoodsOnCampus, locale)}
      >
        <Neighborhoods neighborhoods={campus.neighborhoods} locale={locale} />
      </Section>

      <Section id="transport" title={t(copy.transport, locale)} lead={t(copy.transportLead, locale)}>
        <TransportTable legs={campus.transport} locale={locale} className="max-w-3xl" />
      </Section>

      <Section
        id="climate"
        title={fill(copy.cityClimate, locale, { name: t(city.name, locale) })}
        lead={t(copy.climateCampusLead, locale)}
      >
        <ClimateStrip climate={city.climate} locale={locale} />
      </Section>

      <Section id="verdict" title={t(copy.verdict, locale)}>
        <ProsCons pros={campus.pros} cons={campus.cons} locale={locale} />
      </Section>

      <Section id="faq" title={t(copy.faq, locale)}>
        <Faq items={campus.faq} locale={locale} className="max-w-3xl" />
      </Section>

      <div id="social" className="scroll-mt-32">
        <CampusSocial room={{ kind: "campus", campus: campus.slug }} locale={locale} />
      </div>
    </div>
  );
}
