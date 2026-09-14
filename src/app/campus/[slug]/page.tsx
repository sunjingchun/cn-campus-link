import { ChevronRight, Info } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
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
import { Section } from "@/components/discover/section";
import { SectionNav } from "@/components/discover/section-nav";
import { SpotsBrowser } from "@/components/discover/spots-browser";
import { ScorePill } from "@/components/discover/stat";
import { TransportTable } from "@/components/discover/transport-table";
import { CampusSocial } from "@/components/social/campus-social";
import { campusLabel, cityOfCampus, getCampus } from "@/data";
import { cny, CNY_PER_USD, LANDING_STEPS, overallScore, usd } from "@/lib/domain";
import { countMembersByCampus } from "@/lib/store";

type Props = { params: Promise<{ slug: string }> };

const NAV = [
  { id: "facts", label: "概况" },
  { id: "scores", label: "评分" },
  { id: "money", label: "花多少钱" },
  { id: "landing", label: "落地清单" },
  { id: "spots", label: "周边" },
  { id: "neighborhoods", label: "住哪儿" },
  { id: "transport", label: "交通" },
  { id: "climate", label: "气候" },
  { id: "verdict", label: "优缺点" },
  { id: "faq", label: "常见问题" },
  { id: "social", label: "社区" },
];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const campus = getCampus(slug);
  if (!campus) return {};
  return { title: campusLabel(campus), description: campus.tagline };
}

export default async function CampusPage({ params }: Props) {
  const { slug } = await params;
  const campus = getCampus(slug);
  const city = campus ? cityOfCampus(campus.slug) : undefined;
  if (!campus || !city) notFound();

  const { facts } = campus;
  const members = countMembersByCampus().get(campus.slug) ?? 0;
  const score = overallScore(campus.scores);

  return (
    <div className="mx-auto max-w-7xl space-y-12 px-4 pt-6 pb-24 sm:px-6">
      <ArtHero art={campus.art}>
        <div className="flex flex-col gap-8 p-6 sm:p-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <nav aria-label="面包屑" className="flex flex-wrap items-center gap-1 text-xs text-white/75">
              <Link href="/" className="hover:text-white hover:underline">
                首页
              </Link>
              <ChevronRight className="size-3" aria-hidden />
              <Link href={`/city/${city.slug}`} className="hover:text-white hover:underline">
                {city.name} {city.nameEn}
              </Link>
              <ChevronRight className="size-3" aria-hidden />
              <span className="text-white">{facts.university}</span>
            </nav>
            <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
              {facts.university}
              <span className="ml-2 font-medium text-white/85">{facts.campusName}</span>
            </h1>
            <p className="mt-1.5 text-base text-white/80 sm:text-lg">
              {facts.universityEn} · {facts.campusNameEn}
            </p>
            <p className="mt-5 text-lg leading-snug sm:text-xl">{campus.tagline}</p>
            <p className="mt-1 text-sm text-white/75">{campus.taglineEn}</p>
          </div>

          <dl className="grid grid-cols-2 gap-2 lg:w-[22rem] lg:shrink-0">
            <HeroStat
              label="综合评分"
              en="Overall"
              value={<ScorePill score={score} size="lg" className="shadow-none" />}
              hint="十项平均，满分 100"
            />
            <HeroStat
              label="月预算"
              en="Monthly"
              value={`${cny(campus.budget.frugal)} 起`}
              hint={`舒适 ${cny(campus.budget.comfortable)} · ${usd(campus.budget.comfortable)}`}
            />
            <HeroStat
              label="国际生"
              en="Intl. students"
              value={facts.internationalStudents.toLocaleString("zh-CN")}
              hint={`来自 ${facts.countries} 个国家`}
            />
            <HeroStat label="社区成员" en="Members here" value={members.toLocaleString("zh-CN")} hint="在这个校区" />
          </dl>
        </div>
      </ArtHero>

      <p className="flex items-start gap-2 rounded-xl border border-dashed bg-card/60 px-4 py-2.5 text-xs leading-relaxed text-muted-foreground">
        <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
        <span>
          内容由在读学生维护，政策、价格和办公时间都会变。涉及签证、居留许可、住宿登记的事，行动前请再向学校国际处确认一次。
          Community-maintained and policies change; reconfirm with the international office before you act on it.
        </span>
      </p>

      <SectionNav items={NAV} />

      <Section id="facts" title="概况" en="Quick facts">
        <p className="mb-5 max-w-3xl text-base leading-relaxed text-foreground/90">{campus.summary}</p>
        <QuickFacts facts={facts} />
      </Section>

      <Section id="scores" title="十项评分" en="Scores" lead="1 分很差，5 分很好。悬停或看小字了解每项的口径。">
        <ScoreBars scores={campus.scores} />
      </Section>

      <Section
        id="money"
        title="花多少钱"
        en="Money"
        lead={`月预算不含学费。下面是这个校区的实际单价，美元按 1:${CNY_PER_USD} 粗略换算。`}
      >
        <BudgetTiers budget={campus.budget} />
        <CostGrid costs={campus.costs} className="mt-4" />
      </Section>

      <Section
        id="landing"
        title="落地清单"
        en="Landing checklist"
        lead={`${LANDING_STEPS.length} 步，按顺序做。每一步写明去哪、带什么、花多久，中文地址可以直接复制给司机。`}
      >
        <LandingChecklist landing={campus.landing} />
      </Section>

      <Section id="spots" title="周边" en="Around campus" lead="出了宿舍门能走到的地方：吃什么、买什么、去哪看病，以及那里能不能说英语。">
        <SpotsBrowser spots={campus.spots} />
      </Section>

      <Section id="neighborhoods" title="住哪儿" en="Where to live" lead="住校外的话，附近这几片是同学们真正在住的地方。">
        <Neighborhoods neighborhoods={campus.neighborhoods} />
      </Section>

      <Section id="transport" title="交通" en="Getting around" lead="从校门口出发到市中心、火车站、机场的时间和价格。">
        <TransportTable legs={campus.transport} className="max-w-3xl" />
      </Section>

      <Section id="climate" title={`${city.name}的天气`} en="Climate" lead="全年月均最高、最低气温、雨天数和空气质量。">
        <ClimateStrip climate={city.climate} />
      </Section>

      <Section id="verdict" title="优点与缺点" en="The honest version">
        <ProsCons pros={campus.pros} cons={campus.cons} />
      </Section>

      <Section id="faq" title="常见问题" en="FAQ">
        <Faq items={campus.faq} className="max-w-3xl" />
      </Section>

      <div id="social" className="scroll-mt-32">
        <CampusSocial room={{ kind: "campus", campus: campus.slug }} />
      </div>
    </div>
  );
}
