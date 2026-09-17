import { ArrowRight, Compass } from "lucide-react";
import Link from "next/link";
import { CardArt } from "@/components/art/card-art";
import { campusItem, cityItem, type DiscoverItem } from "@/components/discover/discover-cards";
import { DiscoverGrid } from "@/components/discover/discover-grid";
import { RecentThreads } from "@/components/discover/recent-threads";
import { Section } from "@/components/discover/section";
import { ScorePill } from "@/components/discover/score-pill";
import { Button } from "@/components/ui/button";
import { CAMPUSES, campusesOfCity, CITIES, getCity } from "@/data";
import { copy, fill } from "@/lib/copy";
import { cny, overallScore, type Campus, type City } from "@/lib/domain";
import { localeNumber, t } from "@/lib/locale";
import { readLocale } from "@/lib/read-locale";
import { communityStats, recentPosts } from "@/lib/store";

export default async function Home() {
  const locale = await readLocale();
  const items: DiscoverItem[] = CITIES.flatMap((city) => {
    const campuses = campusesOfCity(city.slug);
    return [cityItem(city, campuses, locale), ...campuses.map((campus) => campusItem(campus, city, locale))];
  });
  const stats = communityStats();
  const posts = recentPosts(false, 8);
  const nanjing = getCity("nanjing");

  const strip = [
    { label: t(copy.cities, locale), value: CITIES.length },
    { label: t(copy.campuses, locale), value: CAMPUSES.length },
    { label: t(copy.members, locale), value: stats.members },
    { label: t(copy.countries, locale), value: stats.countries },
    { label: t(copy.threads, locale), value: stats.posts },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-14 px-4 pt-6 pb-24 sm:px-6 sm:pt-10">
      <section className="relative overflow-hidden rounded-3xl border bg-card px-6 py-12 sm:px-10 sm:py-16">
        <div
          className="animate-drift pointer-events-none absolute -top-24 -left-16 size-72 rounded-full bg-primary/15 blur-3xl"
          aria-hidden
        />
        <div
          className="animate-drift pointer-events-none absolute -right-20 -bottom-28 size-80 rounded-full bg-jade/15 blur-3xl"
          style={{ animationDelay: "-9s" }}
          aria-hidden
        />
        <div className="relative max-w-3xl">
          <p className="animate-rise-in mb-4 inline-flex items-center gap-2 rounded-full border bg-background/70 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
            <Compass className="size-3.5 text-primary" />
            {t(copy.kicker, locale)}
          </p>
          <h1
            className="animate-rise-in text-balance text-3xl font-semibold leading-tight tracking-tight sm:text-5xl sm:leading-[1.15]"
            style={{ animationDelay: "60ms" }}
          >
            {t(copy.homeH1, locale)}
          </h1>
          <div
            className="animate-rise-in mt-7 flex flex-wrap gap-2.5"
            style={{ animationDelay: "180ms" }}
          >
            <Button size="lg" nativeButton={false} render={<Link href="#discover" />}>
              {t(copy.startPicking, locale)}
              <ArrowRight />
            </Button>
            {nanjing ? (
              <Button
                size="lg"
                variant="outline"
                nativeButton={false}
                render={<Link href={`/city/${nanjing.slug}`} />}
              >
                {t(copy.sampleCityCta, locale)}
              </Button>
            ) : null}
          </div>
        </div>
      </section>

      <dl className="grid grid-cols-3 gap-px overflow-hidden rounded-2xl border bg-border sm:grid-cols-5">
        {strip.map((stat) => (
          <div key={stat.label} className="bg-card px-4 py-3.5">
            <dt className="text-xs text-muted-foreground">{stat.label}</dt>
            <dd className="mt-0.5 text-xl font-semibold tabular-nums tracking-tight sm:text-2xl">
              {stat.value.toLocaleString(localeNumber(locale))}
            </dd>
          </div>
        ))}
      </dl>

      <Section id="discover" title={t(copy.discoverTitle, locale)} lead={t(copy.discoverLead, locale)}>
        <DiscoverGrid items={items} />
      </Section>

      {nanjing ? <WorkedExample city={nanjing} campuses={campusesOfCity(nanjing.slug)} locale={locale} /> : null}

      <Section id="threads" title={t(copy.threadsTitle, locale)} lead={t(copy.threadsLead, locale)}>
        <RecentThreads posts={posts} locale={locale} />
      </Section>
    </div>
  );
}

function WorkedExample({
  city,
  campuses,
  locale,
}: {
  city: City;
  campuses: readonly Campus[];
  locale: import("@/lib/locale").Locale;
}) {
  const name = t(city.name, locale);
  return (
    <Section id="example" title={t(copy.exampleTitle, locale)} lead={t(copy.exampleLead, locale)}>
      <div className="grid gap-4 overflow-hidden rounded-3xl border bg-card lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <Link
          href={`/city/${city.slug}`}
          className="group relative block min-h-56 overflow-hidden text-white outline-none focus-visible:ring-3 focus-visible:ring-ring lg:min-h-full"
        >
          <CardArt art={city.art} />
          <div className="relative flex h-full flex-col justify-end p-6">
            <div className="mb-auto flex items-start justify-between">
              <span className="rounded-full bg-stone-950/40 px-2 py-0.5 text-[11px] backdrop-blur-sm">
                {t(city.province, locale)}
              </span>
              <ScorePill score={overallScore(city.scores)} locale={locale} />
            </div>
            <p className="mt-10 text-4xl font-semibold tracking-tight">{name}</p>
            <p className="mt-1 text-sm text-white/85">{t(city.tagline, locale)}</p>
          </div>
        </Link>

        <div className="flex flex-col gap-5 p-6 lg:py-7 lg:pr-8">
          <p className="text-sm leading-relaxed text-muted-foreground">{t(city.summary, locale)}</p>
          <ul className="grid gap-2 text-sm sm:grid-cols-2">
            {city.highlights.map((highlight) => (
              <li key={highlight.zh} className="flex gap-2 rounded-lg bg-muted/60 px-3 py-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                <span>{t(highlight, locale)}</span>
              </li>
            ))}
          </ul>
          <div>
            <p className="mb-2 text-xs text-muted-foreground">
              {fill(copy.listedCampusesCount, locale, { n: campuses.length })} · {t(copy.monthlyBudget, locale)}{" "}
              {cny(city.budget.frugal)} {t(copy.fromBudget, locale)}
            </p>
            <div className="flex flex-wrap gap-2">
              {campuses.map((campus) => (
                <Link
                  key={campus.slug}
                  href={`/campus/${campus.slug}`}
                  className="rounded-full border bg-background px-3 py-1 text-sm transition-colors hover:border-primary/50 hover:text-primary"
                >
                  {t(campus.facts.university, locale)} · {t(campus.facts.campusName, locale)}
                </Link>
              ))}
            </div>
          </div>
          <div className="mt-auto">
            <Button variant="outline" nativeButton={false} render={<Link href={`/city/${city.slug}`} />}>
              {fill(copy.enterCity, locale, { name })}
              <ArrowRight />
            </Button>
          </div>
        </div>
      </div>
    </Section>
  );
}
