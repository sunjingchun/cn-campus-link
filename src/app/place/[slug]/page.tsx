import { ChevronRight, Clock, Phone, TicketCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Backlinks } from "@/components/discover/backlinks";
import { CopyButton } from "@/components/discover/copy-button";
import { PlaceLinks } from "@/components/discover/place-links";
import { Notice, Section } from "@/components/discover/section";
import { SourceLine } from "@/components/discover/source-line";
import { PLACE_LIST, getPlace } from "@/data";
import { placeSlug } from "@/lib/domain";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return PLACE_LIST.map((place) => ({ slug: place.slug as string }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const place = getPlace(slug);
  if (!place) return {};
  return { title: place.name, description: place.address };
}

export default async function PlacePage({ params }: Props) {
  const { slug } = await params;
  const place = getPlace(slug);
  if (!place) notFound();
  const branded = placeSlug(place.slug);

  return (
    <div className="mx-auto max-w-3xl space-y-10 px-4 pt-6 pb-24 sm:px-6">
      <nav aria-label="面包屑" className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-foreground hover:underline">
          首页
        </Link>
        <ChevronRight className="size-3" aria-hidden />
        <span>地点</span>
        <ChevronRight className="size-3" aria-hidden />
        <span className="text-foreground">{place.name}</span>
      </nav>

      <header>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{place.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{place.nameEn}</p>
        <p className="mt-4 text-lg leading-relaxed tracking-wide">{place.address}</p>
      </header>

      <Notice>
        地址会变。出发前再向学校国际处确认一次。
        Reconfirm with the international office before you go.
      </Notice>

      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div className="rounded-xl border bg-card px-4 py-3">
          <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="size-3.5" aria-hidden />
            办公时间
          </dt>
          <dd className="mt-1">{place.hours ?? "办公时间未核实"}</dd>
        </div>
        <div className="rounded-xl border bg-card px-4 py-3">
          <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <TicketCheck className="size-3.5" aria-hidden />
            要不要预约
          </dt>
          <dd className="mt-1">
            {place.appointment === true ? "需要预约" : place.appointment === false ? "不用预约" : "是否预约未核实"}
          </dd>
        </div>
        <div className="rounded-xl border bg-card px-4 py-3 sm:col-span-2">
          <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Phone className="size-3.5" aria-hidden />
            电话
          </dt>
          <dd className="mt-1">{place.phone ?? "电话未核实"}</dd>
        </div>
      </dl>

      {place.note ? (
        <p className="rounded-xl bg-muted px-4 py-3 text-sm leading-relaxed">{place.note}</p>
      ) : null}

      <SourceLine
        sources={place.sources}
        unverified="地址与时间未核实，出发前请与学校国际处确认"
      />

      <PlaceLinks place={place} />

      <CopyButton text={`${place.name} ${place.address}`} label="复制中文地址给司机看" />

      <Section title="从各校区怎么去" en="How to get there" lead="核验过的路线会写在这里。现在还没有。">
        <p className="text-sm text-muted-foreground">还没有从校门出发的核验路线。出发前问国际处或看地图深链。</p>
      </Section>

      <Section title="谁在用这个地点" en="Backlinks">
        <Backlinks slug={branded} />
      </Section>
    </div>
  );
}
