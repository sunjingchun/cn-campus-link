import { Clock, MapPin } from "lucide-react";
import Link from "next/link";
import { copy } from "@/lib/copy";
import type { Place } from "@/lib/domain";
import { t, type Locale } from "@/lib/locale";
import { cn } from "@/lib/utils";
import { CopyButton } from "./copy-button";
import { SourceLine } from "./source-line";

export function PlaceBlock({
  place,
  locale,
  className,
}: {
  place: Place;
  locale: Locale;
  className?: string;
}) {
  const name = t(place.name, locale);
  return (
    <div className={cn("rounded-xl border bg-card p-4", className)}>
      <div className="flex items-start gap-3">
        <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
          <MapPin className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-medium leading-snug">
            <Link href={`/place/${place.slug}`} className="hover:underline">
              {name}
            </Link>
          </p>
          <p data-cjk-intentional className="mt-2 text-base leading-relaxed tracking-wide">
            {place.address}
          </p>
          {place.hours ? (
            <p className="mt-2 flex items-start gap-1.5 text-xs text-muted-foreground">
              <Clock className="mt-0.5 size-3.5 shrink-0" />
              <span>{t(place.hours, locale)}</span>
            </p>
          ) : null}
          {place.note ? (
            <p className="mt-2 rounded-lg bg-muted px-2.5 py-1.5 text-xs leading-relaxed text-muted-foreground">
              {t(place.note, locale)}
            </p>
          ) : null}
          <SourceLine
            sources={place.sources}
            unverified={t(copy.addressUnverified, locale)}
            locale={locale}
            className="mt-2"
          />
          <CopyButton
            text={`${place.name.zh} ${place.address}`}
            label={t(copy.copyAddress, locale)}
            className="mt-3"
          />
        </div>
      </div>
    </div>
  );
}
