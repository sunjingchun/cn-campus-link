import { Clock, MapPin } from "lucide-react";
import type { Place } from "@/lib/domain";
import { cn } from "@/lib/utils";
import { CopyButton } from "./copy-button";
import { SourceLine } from "./source-line";

/**
 * A place, laid out to be shown to a driver or a clerk: the Chinese name and
 * address are the biggest text, the English is there for the reader.
 */
export function PlaceBlock({
  place,
  copyLabel = "复制中文地址给司机看",
  className,
}: {
  place: Place;
  copyLabel?: string;
  className?: string;
}) {
  return (
    <div className={cn("rounded-xl border bg-card p-4", className)}>
      <div className="flex items-start gap-3">
        <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
          <MapPin className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-medium leading-snug">{place.name}</p>
          <p className="text-xs text-muted-foreground">{place.nameEn}</p>
          <p className="mt-2 text-base leading-relaxed tracking-wide">{place.address}</p>
          {place.hours ? (
            <p className="mt-2 flex items-start gap-1.5 text-xs text-muted-foreground">
              <Clock className="mt-0.5 size-3.5 shrink-0" />
              <span>{place.hours}</span>
            </p>
          ) : null}
          {place.note ? (
            <p className="mt-2 rounded-lg bg-muted px-2.5 py-1.5 text-xs leading-relaxed text-muted-foreground">
              {place.note}
            </p>
          ) : null}
          <SourceLine
            sources={place.sources}
            unverified="地址与时间未核实，出发前请与学校国际处确认"
            className="mt-2"
          />
          <CopyButton text={`${place.name} ${place.address}`} label={copyLabel} className="mt-3" />
        </div>
      </div>
    </div>
  );
}
