import { SCORE_KEYS, SCORE_META, type Score, type Scorecard } from "@/lib/domain";
import { t, type Locale } from "@/lib/locale";
import { cn } from "@/lib/utils";

function tone(value: Score): string {
  if (value >= 4) return "bg-jade";
  if (value === 3) return "bg-amber-500";
  return "bg-primary";
}

export function ScoreBars({
  scores,
  locale,
  className,
}: {
  scores: Scorecard;
  locale: Locale;
  className?: string;
}) {
  return (
    <ul className={cn("grid gap-x-8 gap-y-3 sm:grid-cols-2", className)}>
      {SCORE_KEYS.map((key) => {
        const meta = SCORE_META[key];
        const value = scores[key];
        const label = t(meta, locale);
        const hint = t(meta.hint, locale);
        return (
          <li key={key} title={hint} className="group/score">
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-sm font-medium">{label}</p>
              <p className="text-sm font-semibold tabular-nums">
                {value}
                <span className="text-xs font-normal text-muted-foreground"> / 5</span>
              </p>
            </div>
            <div
              className="mt-1.5 grid grid-cols-5 gap-1"
              role="meter"
              aria-valuemin={1}
              aria-valuemax={5}
              aria-valuenow={value}
              aria-label={`${label} ${value} / 5`}
            >
              {Array.from({ length: 5 }, (_, i) => (
                <span
                  key={i}
                  className={cn("h-2 rounded-full", i < value ? tone(value) : "bg-muted")}
                />
              ))}
            </div>
            <p className="mt-1 text-[11px] leading-snug text-muted-foreground">{hint}</p>
          </li>
        );
      })}
    </ul>
  );
}
