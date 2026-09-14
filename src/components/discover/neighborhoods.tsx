import { Route, TriangleAlert } from "lucide-react";
import { cny, usd, type Neighborhood } from "@/lib/domain";
import { cn } from "@/lib/utils";

export function Neighborhoods({
  neighborhoods,
  className,
}: {
  neighborhoods: readonly Neighborhood[];
  className?: string;
}) {
  return (
    <ul className={cn("grid gap-3 md:grid-cols-3", className)}>
      {neighborhoods.map((area, index) => {
        const [low, high] = area.rentCny;
        return (
          <li
            key={area.name}
            className="animate-rise-in flex flex-col rounded-2xl border bg-card p-5"
            style={{ animationDelay: `${index * 60}ms` }}
          >
            <p className="text-lg font-semibold tracking-tight">{area.name}</p>
            <p className="text-xs text-muted-foreground">{area.nameEn}</p>
            <p className="mt-2 text-sm leading-relaxed">{area.vibe}</p>

            <dl className="mt-4 space-y-2 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">一居室月租 · Studio rent</dt>
                <dd className="font-semibold tabular-nums tracking-tight">
                  {cny(low)} – {cny(high)}
                  <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                    {usd(low)} – {usd(high)}
                  </span>
                </dd>
              </div>
              <div className="flex items-start gap-1.5">
                <Route className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                <dt className="sr-only">通勤</dt>
                <dd>{area.commute}</dd>
              </div>
            </dl>

            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-muted-foreground">适合</span>
              {area.goodFor.map((tag) => (
                <span key={tag} className="rounded-full bg-jade/10 px-2 py-0.5 text-xs text-jade">
                  {tag}
                </span>
              ))}
            </div>

            {area.watchOut ? (
              <p className="mt-4 flex gap-2 rounded-lg bg-amber-500/10 px-3 py-2 text-xs leading-relaxed text-amber-800">
                <TriangleAlert className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                <span>{area.watchOut}</span>
              </p>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
