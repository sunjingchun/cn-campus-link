import { CloudRain } from "lucide-react";
import { MONTH_LABELS, type Climate } from "@/lib/domain";
import { cn } from "@/lib/utils";

const SCALE_MIN_C = -10;
const SCALE_MAX_C = 40;

const AQI_BANDS = [
  { max: 50, label: "优", className: "bg-jade/15 text-jade" },
  { max: 100, label: "良", className: "bg-amber-500/15 text-amber-700" },
  { max: 150, label: "轻度", className: "bg-orange-500/15 text-orange-700" },
  { max: Number.POSITIVE_INFINITY, label: "中度+", className: "bg-destructive/10 text-destructive" },
] as const;

function aqiBand(aqi: number) {
  return AQI_BANDS.find((band) => aqi <= band.max) ?? AQI_BANDS[AQI_BANDS.length - 1];
}

function tempTone(highC: number): string {
  if (highC >= 30) return "bg-primary";
  if (highC >= 20) return "bg-amber-400";
  if (highC >= 10) return "bg-jade";
  return "bg-sky-500";
}

export function ClimateStrip({ climate, className }: { climate: Climate; className?: string }) {
  const currentMonth = new Date().getMonth() + 1;
  const span = SCALE_MAX_C - SCALE_MIN_C;

  return (
    <div className={cn("rounded-2xl border bg-card", className)}>
      {/* `relative` makes this the containing block for the absolutely positioned
          sr-only labels below. Without it they resolve against the page and widen
          the whole document by the strip's 680px instead of scrolling inside it. */}
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
                  {MONTH_LABELS[month.month - 1]}
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
                  title={`AQI ${month.aqi} · ${band.label}`}
                >
                  {month.aqi}
                </span>
                <span className="sr-only">
                  最高 {month.highC}°C，最低 {month.lowC}°C，雨天 {month.rainDays} 天，AQI {month.aqi}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
      <p className="flex flex-wrap gap-x-4 gap-y-1 border-t px-4 py-2.5 text-[11px] text-muted-foreground">
        <span>柱子是月均最低到最高气温，-10°C 到 40°C</span>
        <span className="inline-flex items-center gap-1">
          <CloudRain className="size-3" aria-hidden />
          月雨天数
        </span>
        <span>底部彩色数字是月均 AQI：{AQI_BANDS.map((band) => band.label).join(" / ")}</span>
      </p>
    </div>
  );
}
