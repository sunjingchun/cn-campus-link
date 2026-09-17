import { CloudRain } from "lucide-react";
import { copy, fill } from "@/lib/copy";
import { MONTH_LABELS, type Climate } from "@/lib/domain";
import { t, type Locale } from "@/lib/locale";
import { cn } from "@/lib/utils";

const SCALE_MIN_C = -10;
const SCALE_MAX_C = 40;

const AQI_COPY = [
  { max: 50, label: copy.aqiGood, className: "bg-jade/15 text-jade" },
  { max: 100, label: copy.aqiOk, className: "bg-amber-500/15 text-amber-700" },
  { max: 150, label: copy.aqiLight, className: "bg-orange-500/15 text-orange-700" },
  { max: Number.POSITIVE_INFINITY, label: copy.aqiMid, className: "bg-destructive/10 text-destructive" },
] as const;

function aqiBand(aqi: number) {
  return AQI_COPY.find((band) => aqi <= band.max) ?? AQI_COPY[AQI_COPY.length - 1];
}

function tempTone(highC: number): string {
  if (highC >= 30) return "bg-primary";
  if (highC >= 20) return "bg-amber-400";
  if (highC >= 10) return "bg-jade";
  return "bg-sky-500";
}

export function ClimateStrip({
  climate,
  locale,
  className,
}: {
  climate: Climate;
  locale: Locale;
  className?: string;
}) {
  const currentMonth = new Date().getMonth() + 1;
  const span = SCALE_MAX_C - SCALE_MIN_C;

  return (
    <div className={cn("rounded-2xl border bg-card", className)}>
      <div className="no-scrollbar relative overflow-x-auto">
        <ol className="grid min-w-[680px] grid-cols-12 gap-1 px-3 pt-4 pb-3 sm:px-4">
          {climate.map((month) => {
            const band = aqiBand(month.aqi);
            const isNow = month.month === currentMonth;
            return (
              <li
                key={month.month}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-xl px-1 py-2 text-center",
                  isNow && "bg-accent ring-1 ring-primary/30",
                )}
                aria-current={isNow ? "date" : undefined}
              >
                <span className={cn("text-xs", isNow ? "font-semibold text-primary" : "text-muted-foreground")}>
                  {t(MONTH_LABELS[month.month - 1], locale)}
                </span>
                <span className="text-sm font-semibold tabular-nums">{month.highC}°</span>
                <span className="relative h-20 w-2.5 rounded-full bg-muted" aria-hidden>
                  <span
                    className={cn("absolute inset-x-0 rounded-full", tempTone(month.highC))}
                    style={{
                      bottom: `${((month.lowC - SCALE_MIN_C) / span) * 100}%`,
                      height: `${((month.highC - month.lowC) / span) * 100}%`,
                    }}
                  />
                </span>
                <span className="text-sm tabular-nums text-muted-foreground">{month.lowC}°</span>
                <span className="mt-1 inline-flex items-center gap-0.5 text-[11px] tabular-nums text-muted-foreground">
                  <CloudRain className="size-3" aria-hidden />
                  {month.rainDays}
                </span>
                <span
                  className={cn("rounded-full px-1.5 py-0.5 text-[10px] font-medium tabular-nums", band.className)}
                  title={`AQI ${month.aqi} · ${t(band.label, locale)}`}
                >
                  {month.aqi}
                </span>
                <span className="sr-only">
                  {fill(copy.climateSr, locale, {
                    high: month.highC,
                    low: month.lowC,
                    rain: month.rainDays,
                    aqi: month.aqi,
                  })}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
      <p className="flex flex-wrap gap-x-4 gap-y-1 border-t px-4 py-2.5 text-[11px] text-muted-foreground">
        <span>{t(copy.climateScale, locale)}</span>
        <span className="inline-flex items-center gap-1">
          <CloudRain className="size-3" aria-hidden />
          {t(copy.rainDays, locale)}
        </span>
        <span>
          {t(copy.aqiLegend, locale)}
          {AQI_COPY.map((band) => t(band.label, locale)).join(" / ")}
        </span>
      </p>
    </div>
  );
}
