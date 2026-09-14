import { SCORE_KEYS, SCORE_META, type Score, type Scorecard } from "@/lib/domain";
import { cn } from "@/lib/utils";

function tone(value: Score): string {
  if (value >= 4) return "bg-jade";
  if (value === 3) return "bg-amber-500";
  return "bg-primary";
}

/**
 * Ten rows, one per score key. A five-segment bar rather than a percentage
 * because the underlying value is 1-5 and pretending otherwise adds nothing.
 */
export function ScoreBars({ scores, className }: { scores: Scorecard; className?: string }) {
  return (
    <ul className={cn("grid gap-x-8 gap-y-3 sm:grid-cols-2", className)}>
      {SCORE_KEYS.map((key) => {
        const meta = SCORE_META[key];
        const value = scores[key];
        return (
          <li key={key} title={meta.hint} className="group/score">
            <div className="flex items-baseline justify-between gap-3">
              <p className="flex items-baseline gap-1.5 text-sm">
                <span className="font-medium">{meta.zh}</span>
                <span className="text-xs text-muted-foreground">{meta.en}</span>
              </p>
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
              aria-label={`${meta.zh} ${value} / 5`}
            >
              {Array.from({ length: 5 }, (_, i) => (
                <span
                  key={i}
                  className={cn("h-2 rounded-full", i < value ? tone(value) : "bg-muted")}
                />
              ))}
            </div>
            <p className="mt-1 text-[11px] leading-snug text-muted-foreground">{meta.hint}</p>
          </li>
        );
      })}
    </ul>
  );
}
