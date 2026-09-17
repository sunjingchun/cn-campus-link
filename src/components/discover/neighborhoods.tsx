import { Route, TriangleAlert } from "lucide-react";
import { copy } from "@/lib/copy";
import { cny, usd, type Neighborhood } from "@/lib/domain";
import { t, type Locale } from "@/lib/locale";
import { cn } from "@/lib/utils";

export function Neighborhoods({
  neighborhoods,
  locale,
  className,
}: {
  neighborhoods: readonly Neighborhood[];
  locale: Locale;
  className?: string;
}) {
  return (
    <ul className={cn("grid gap-3 md:grid-cols-3", className)}>
      {neighborhoods.map((area, index) => {
        const [low, high] = area.rentCny;
        const name = t(area.name, locale);
        return (
          <li
            key={area.name.zh}
            className="animate-rise-in flex flex-col rounded-2xl border bg-card p-5"
            style={{ animationDelay: `${index * 60}ms` }}
          >
            <p className="text-lg font-semibold tracking-tight">{name}</p>
            <p className="mt-2 text-sm leading-relaxed">{t(area.vibe, locale)}</p>

            <dl className="mt-4 space-y-2 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">
                  {t(area.rentUnit === "year" ? copy.dormYear : copy.studioRent, locale)}
                </dt>
                <dd className="font-semibold tabular-nums tracking-tight">
                  {cny(low)} – {cny(high)}
                  <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                    {usd(low)} – {usd(high)}
                  </span>
                </dd>
              </div>
              <div className="flex items-start gap-1.5">
                <Route className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                <dt className="sr-only">{t(copy.commute, locale)}</dt>
                <dd>{t(area.commute, locale)}</dd>
              </div>
            </dl>

            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-muted-foreground">{t(copy.goodFor, locale)}</span>
              {area.goodFor.map((tag) => (
                <span key={tag.zh} className="rounded-full bg-jade/10 px-2 py-0.5 text-xs text-jade">
                  {t(tag, locale)}
                </span>
              ))}
            </div>

            {area.watchOut ? (
              <p className="mt-4 flex gap-2 rounded-lg bg-amber-500/10 px-3 py-2 text-xs leading-relaxed text-amber-800">
                <TriangleAlert className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                <span>{t(area.watchOut, locale)}</span>
              </p>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
