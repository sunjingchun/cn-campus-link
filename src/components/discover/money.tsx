import {
  BUDGET_META,
  BUDGET_TIERS,
  cny,
  CNY_PER_USD,
  COST_ITEMS,
  COST_META,
  usd,
  type CostItem,
  type MonthlyBudget,
} from "@/lib/domain";
import { cn } from "@/lib/utils";

export function BudgetTiers({ budget, className }: { budget: MonthlyBudget; className?: string }) {
  return (
    <div className={cn("grid gap-3 sm:grid-cols-3", className)}>
      {BUDGET_TIERS.map((tier, index) => {
        const meta = BUDGET_META[tier];
        const highlighted = tier === "comfortable";
        return (
          <div
            key={tier}
            className={cn(
              "animate-rise-in relative overflow-hidden rounded-2xl border p-5",
              highlighted ? "border-primary/40 bg-primary/5 shadow-sm" : "bg-card",
            )}
            style={{ animationDelay: `${index * 60}ms` }}
          >
            {highlighted ? (
              <span className="absolute top-3 right-3 rounded-full bg-primary px-2 py-0.5 text-[10px] font-medium text-primary-foreground">
                多数人
              </span>
            ) : null}
            <p className="flex items-baseline gap-1.5">
              <span className="font-medium">{meta.zh}</span>
              <span className="text-xs text-muted-foreground">{meta.en}</span>
            </p>
            <p className="mt-3 text-3xl font-semibold tabular-nums tracking-tight">
              {cny(budget[tier])}
              <span className="ml-1 text-sm font-normal text-muted-foreground">/ 月</span>
            </p>
            <p className="text-sm tabular-nums text-muted-foreground">≈ {usd(budget[tier])} / month</p>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{meta.hint}</p>
          </div>
        );
      })}
    </div>
  );
}

export function CostGrid({
  costs,
  className,
}: {
  costs: Partial<Record<CostItem, number>>;
  className?: string;
}) {
  const defined = COST_ITEMS.filter((item) => costs[item] !== undefined);
  if (defined.length === 0) return null;
  return (
    <dl
      className={cn(
        "grid grid-cols-2 gap-px overflow-hidden rounded-2xl border bg-border sm:grid-cols-3 lg:grid-cols-4",
        className,
      )}
    >
      {defined.map((item) => {
        const meta = COST_META[item];
        const amount = costs[item] ?? 0;
        return (
          <div key={item} className="bg-card px-4 py-3">
            <dt className="text-xs text-muted-foreground">
              {meta.zh}
              <span className="ml-1 text-[11px] opacity-70">{meta.en}</span>
            </dt>
            <dd className="mt-0.5 flex flex-wrap items-baseline gap-x-1.5 tabular-nums">
              <span className="text-lg font-semibold tracking-tight">
                {amount === 0 ? "免费" : cny(amount)}
              </span>
              <span className="text-xs text-muted-foreground">
                {meta.unit}
                {amount >= CNY_PER_USD ? ` · ${usd(amount)}` : ""}
              </span>
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
