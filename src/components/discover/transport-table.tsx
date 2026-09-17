import {
  Bike,
  Bus,
  CarTaxiFront,
  Footprints,
  Train,
  TrainFront,
  type LucideIcon,
} from "lucide-react";
import { copy, fill } from "@/lib/copy";
import { cny, TRANSPORT_META, type TransportLeg, type TransportMode } from "@/lib/domain";
import { t, type Locale } from "@/lib/locale";
import { cn } from "@/lib/utils";

const TRANSPORT_ICON: Readonly<Record<TransportMode, LucideIcon>> = {
  metro: TrainFront,
  bus: Bus,
  taxi: CarTaxiFront,
  bike: Bike,
  rail: Train,
  walk: Footprints,
};

export function TransportTable({
  legs,
  locale,
  className,
}: {
  legs: readonly TransportLeg[];
  locale: Locale;
  className?: string;
}) {
  return (
    <ul className={cn("divide-y overflow-hidden rounded-2xl border bg-card", className)}>
      {legs.map((leg, index) => {
        const Icon = TRANSPORT_ICON[leg.mode];
        const mode = t(TRANSPORT_META[leg.mode], locale);
        return (
          <li key={`${leg.to.zh}-${leg.mode}-${index}`} className="flex items-start gap-3 px-4 py-3">
            <span
              className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg bg-secondary text-secondary-foreground"
              title={mode}
            >
              <Icon className="size-4" aria-hidden />
              <span className="sr-only">{mode}</span>
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{t(leg.to, locale)}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{mode}</p>
              {leg.note ? <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{t(leg.note, locale)}</p> : null}
            </div>
            <div className="shrink-0 text-right tabular-nums">
              <p className="text-sm font-semibold">{fill(copy.minutes, locale, { n: leg.minutes })}</p>
              <p className="text-xs text-muted-foreground">{leg.cny === 0 ? t(copy.free, locale) : cny(leg.cny)}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
