import {
  Bike,
  Bus,
  CarTaxiFront,
  Footprints,
  Train,
  TrainFront,
  type LucideIcon,
} from "lucide-react";
import { cny, TRANSPORT_META, type TransportLeg, type TransportMode } from "@/lib/domain";
import { cn } from "@/lib/utils";

const TRANSPORT_ICON: Readonly<Record<TransportMode, LucideIcon>> = {
  metro: TrainFront,
  bus: Bus,
  taxi: CarTaxiFront,
  bike: Bike,
  rail: Train,
  walk: Footprints,
};

export function TransportTable({ legs, className }: { legs: readonly TransportLeg[]; className?: string }) {
  return (
    <ul className={cn("divide-y overflow-hidden rounded-2xl border bg-card", className)}>
      {legs.map((leg, index) => {
        const Icon = TRANSPORT_ICON[leg.mode];
        const mode = TRANSPORT_META[leg.mode];
        return (
          <li key={`${leg.to}-${leg.mode}-${index}`} className="flex items-start gap-3 px-4 py-3">
            <span
              className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg bg-secondary text-secondary-foreground"
              title={`${mode.zh} · ${mode.en}`}
            >
              <Icon className="size-4" aria-hidden />
              <span className="sr-only">{mode.zh}</span>
            </span>
            <div className="min-w-0 flex-1">
              <p className="flex flex-wrap items-baseline gap-x-2 text-sm">
                <span className="font-medium">{leg.to}</span>
                <span className="text-xs text-muted-foreground">{leg.toEn}</span>
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {mode.zh} · {mode.en}
              </p>
              {leg.note ? <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{leg.note}</p> : null}
            </div>
            <div className="shrink-0 text-right tabular-nums">
              <p className="text-sm font-semibold">{leg.minutes} 分钟</p>
              <p className="text-xs text-muted-foreground">{leg.cny === 0 ? "免费" : cny(leg.cny)}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
