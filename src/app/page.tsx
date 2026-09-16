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
import { cny, overallScore, type Campus, type City } from "@/lib/domain";
import { communityStats, recentPosts } from "@/lib/store";

export default function Home() {
  const items: DiscoverItem[] = CITIES.flatMap((city) => {
    const campuses = campusesOfCity(city.slug);
    return [cityItem(city, campuses), ...campuses.map((campus) => campusItem(campus, city))];
  });
  const stats = communityStats();
  const posts = recentPosts(false, 8);
  const nanjing = getCity("nanjing");

  const strip = [
    { label: "城市", en: "Cities", value: CITIES.length },
    { label: "校区", en: "Campuses", value: CAMPUSES.length },
    { label: "成员", en: "Members", value: stats.members },
    { label: "国家", en: "Countries", value: stats.countries },
    { label: "帖子", en: "Threads", value: stats.posts },
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
            你好校园 · 来华留学生的城市与校区指南
          </p>
          <h1
            className="animate-rise-in text-balance text-3xl font-semibold leading-tight tracking-tight sm:text-5xl sm:leading-[1.15]"
            style={{ animationDelay: "60ms" }}
          >
            按城市和校区整理的来华留学指南：多少钱、怎么落地、附近吃什么、谁已经在那儿。
          </h1>
          <p
            className="animate-rise-in mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg"
            style={{ animationDelay: "120ms" }}
          >
            A city-by-city, campus-by-campus guide to studying in China: what it costs, how to
            land in your first week, where to eat, and who is already there.
          </p>
          <div
            className="animate-rise-in mt-7 flex flex-wrap gap-2.5"
            style={{ animationDelay: "180ms" }}
          >
            <Button size="lg" nativeButton={false} render={<Link href="#discover" />}>
              开始挑校区
              <ArrowRight />
            </Button>
            {nanjing ? (
              <Button
                size="lg"
                variant="outline"
                nativeButton={false}
                render={<Link href={`/city/${nanjing.slug}`} />}
              >
                先看样板城市 {nanjing.name}
              </Button>
            ) : null}
          </div>
        </div>
      </section>

      <dl className="grid grid-cols-3 gap-px overflow-hidden rounded-2xl border bg-border sm:grid-cols-5">
        {strip.map((stat) => (
          <div key={stat.label} className="bg-card px-4 py-3.5">
            <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
              {stat.label}
              <span className="hidden text-[11px] opacity-70 lg:inline">{stat.en}</span>
            </dt>
            <dd className="mt-0.5 text-xl font-semibold tabular-nums tracking-tight sm:text-2xl">
              {stat.value.toLocaleString("zh-CN")}
            </dd>
          </div>
        ))}
      </dl>

      <Section
        id="discover"
        title="城市与校区"
        en="Cities & campuses"
        lead="综合评分是十项打分的平均值，月预算不含学费。先按城市挑，再进校区看落地清单。"
      >
        <DiscoverGrid items={items} />
      </Section>

      {nanjing ? <WorkedExample city={nanjing} campuses={campusesOfCity(nanjing.slug)} /> : null}

      <Section
        id="threads"
        title="最新讨论"
        en="Latest threads"
        lead="留言板上刚发出来的帖子。点进去就是那个校区或城市的社区。"
      >
        <RecentThreads posts={posts} />
      </Section>
    </div>
  );
}

function WorkedExample({ city, campuses }: { city: City; campuses: readonly Campus[] }) {
  return (
    <Section
      id="example"
      title={`先看${city.name}`}
      en="The worked example"
      lead="每个城市都会按这个深度写：具体的地址、具体的价格、具体的坑。南京是第一个写完的。"
    >
      <div className="grid gap-4 overflow-hidden rounded-3xl border bg-card lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <Link
          href={`/city/${city.slug}`}
          className="group relative block min-h-56 overflow-hidden text-white outline-none focus-visible:ring-3 focus-visible:ring-ring lg:min-h-full"
        >
          <CardArt art={city.art} />
          <div className="relative flex h-full flex-col justify-end p-6">
            <div className="mb-auto flex items-start justify-between">
              <span className="rounded-full bg-stone-950/40 px-2 py-0.5 text-[11px] backdrop-blur-sm">
                {city.province}
              </span>
              <ScorePill score={overallScore(city.scores)} />
            </div>
            <p className="mt-10 text-4xl font-semibold tracking-tight">
              {city.name}
              <span className="ml-2 text-lg font-normal text-white/75">{city.nameEn}</span>
            </p>
            <p className="mt-1 text-sm text-white/85">{city.tagline}</p>
          </div>
        </Link>

        <div className="flex flex-col gap-5 p-6 lg:py-7 lg:pr-8">
          <p className="text-sm leading-relaxed text-muted-foreground">{city.summary}</p>
          <ul className="grid gap-2 text-sm sm:grid-cols-2">
            {city.highlights.map((highlight) => (
              <li key={highlight} className="flex gap-2 rounded-lg bg-muted/60 px-3 py-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
          <div>
            <p className="mb-2 text-xs text-muted-foreground">
              已收录 {campuses.length} 个校区 · 月预算 {cny(city.budget.frugal)} 起
            </p>
            <div className="flex flex-wrap gap-2">
              {campuses.map((campus) => (
                <Link
                  key={campus.slug}
                  href={`/campus/${campus.slug}`}
                  className="rounded-full border bg-background px-3 py-1 text-sm transition-colors hover:border-primary/50 hover:text-primary"
                >
                  {campus.facts.university} · {campus.facts.campusName}
                </Link>
              ))}
            </div>
          </div>
          <div className="mt-auto">
            <Button variant="outline" nativeButton={false} render={<Link href={`/city/${city.slug}`} />}>
              进入{city.name}
              <ArrowRight />
            </Button>
          </div>
        </div>
      </div>
    </Section>
  );
}
