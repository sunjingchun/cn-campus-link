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
import { copy } from "@/lib/copy";
import { placeSlug } from "@/lib/domain";
import { t } from "@/lib/locale";
import { readLocale } from "@/lib/read-locale";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return PLACE_LIST.map((place) => ({ slug: place.slug as string }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await readLocale();
  const { slug } = await params;
  const place = getPlace(slug);
  if (!place) return {};
  return { title: t(place.name, locale), description: place.address };
}

export default async function PlacePage({ params }: Props) {
  const locale = await readLocale();
  const { slug } = await params;
  const place = getPlace(slug);
  if (!place) notFound();
  const branded = placeSlug(place.slug);
  const appointment =
    place.appointment === true
      ? t(copy.appointmentYes, locale)
      : place.appointment === false
        ? t(copy.appointmentNo, locale)
        : t(copy.appointmentUnknown, locale);

  return (
    <div className="mx-auto max-w-3xl space-y-10 px-4 pt-6 pb-24 sm:px-6">
      <nav aria-label={t(copy.breadcrumb, locale)} className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-foreground hover:underline">
          {t(copy.home, locale)}
        </Link>
        <ChevronRight className="size-3" aria-hidden />
        <span>{t(copy.places, locale)}</span>
        <ChevronRight className="size-3" aria-hidden />
        <span className="text-foreground">{t(place.name, locale)}</span>
      </nav>

      <header>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{t(place.name, locale)}</h1>
        <p data-cjk-intentional className="mt-4 text-lg leading-relaxed tracking-wide">
          {place.address}
        </p>
      </header>

      <Notice>{t(copy.noticePlace, locale)}</Notice>

      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div className="rounded-xl border bg-card px-4 py-3">
          <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="size-3.5" aria-hidden />
            {t(copy.hours, locale)}
          </dt>
          <dd className="mt-1">{place.hours ? t(place.hours, locale) : t(copy.hoursUnknown, locale)}</dd>
        </div>
        <div className="rounded-xl border bg-card px-4 py-3">
          <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <TicketCheck className="size-3.5" aria-hidden />
            {t(copy.appointment, locale)}
          </dt>
          <dd className="mt-1">{appointment}</dd>
        </div>
        <div className="rounded-xl border bg-card px-4 py-3 sm:col-span-2">
          <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Phone className="size-3.5" aria-hidden />
            {t(copy.phone, locale)}
          </dt>
          <dd className="mt-1">{place.phone ?? t(copy.phoneUnknown, locale)}</dd>
        </div>
      </dl>

      {place.note ? (
        <p className="rounded-xl bg-muted px-4 py-3 text-sm leading-relaxed">{t(place.note, locale)}</p>
      ) : null}

      <SourceLine sources={place.sources} unverified={t(copy.addressUnverified, locale)} locale={locale} />

      <PlaceLinks place={place} locale={locale} />

      <CopyButton text={`${place.name.zh} ${place.address}`} label={t(copy.copyAddress, locale)} />

      <Section title={t(copy.howToGetThere, locale)} lead={t(copy.howToGetThereLead, locale)}>
        <p className="text-sm text-muted-foreground">{t(copy.noVerifiedRoute, locale)}</p>
      </Section>

      <Section title={t(copy.whoUses, locale)}>
        <Backlinks slug={branded} locale={locale} />
      </Section>
    </div>
  );
}
