"use client";

import { ArrowUpDown, Search, SearchX, X } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { useT } from "@/components/site/locale-switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { copy } from "@/lib/copy";
import { cny } from "@/lib/domain";
import { t } from "@/lib/locale";
import { cn } from "@/lib/utils";
import { DiscoverCard } from "./discover-card";
import {
  applyQuery,
  BUDGET_CAPS,
  DEFAULT_QUERY,
  isFiltered,
  QUALITY_CHIPS,
  SORTS,
  VIEWS,
  type BudgetCap,
  type DiscoverItem,
  type DiscoverQuery,
  type QualityId,
  type SortId,
  type ViewId,
} from "./discover-cards";

export function DiscoverGrid({ items }: { items: DiscoverItem[] }) {
  const { locale, t: tr, fill: fmt } = useT();
  const [query, setQuery] = useState<DiscoverQuery>(DEFAULT_QUERY);
  const results = useMemo(() => applyQuery(items, query), [items, query]);

  const otherView: ViewId = query.view === "city" ? "campus" : "city";
  const otherCount = useMemo(
    () => applyQuery(items, { ...query, view: otherView }).length,
    [items, query, otherView],
  );
  const totals = useMemo(
    () => ({
      city: items.filter((item) => item.kind === "city").length,
      campus: items.filter((item) => item.kind === "campus").length,
    }),
    [items],
  );

  const patch = (next: Partial<DiscoverQuery>) => setQuery((prev) => ({ ...prev, ...next }));
  const toggleQuality = (id: QualityId) =>
    setQuery((prev) => ({
      ...prev,
      quality: prev.quality.includes(id)
        ? prev.quality.filter((q) => q !== id)
        : [...prev.quality, id],
    }));

  const noun = t(VIEWS.find((view) => view.id === query.view)?.noun ?? copy.nounCity, locale);
  const otherLabel = t(VIEWS.find((view) => view.id === otherView)?.label ?? copy.byCampus, locale);
  const sortLabel = t(SORTS.find((sort) => sort.id === query.sort)?.label ?? copy.overall, locale);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div
          role="group"
          aria-label={tr(copy.viewMode)}
          className="inline-flex w-fit shrink-0 rounded-xl bg-muted p-1"
        >
          {VIEWS.map((view) => (
            <button
              key={view.id}
              type="button"
              aria-pressed={query.view === view.id}
              onClick={() => patch({ view: view.id })}
              className={cn(
                "rounded-lg px-3.5 py-1.5 text-sm font-medium transition-all outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                query.view === view.id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t(view.label, locale)}
              <span className="ml-1.5 text-xs font-normal tabular-nums opacity-70">
                {totals[view.id]}
              </span>
            </button>
          ))}
        </div>

        <label className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={query.search}
            onChange={(event) => patch({ search: event.target.value })}
            placeholder={query.view === "city" ? tr(copy.searchCity) : tr(copy.searchCampus)}
            aria-label={tr(copy.search)}
            className="h-10 rounded-xl bg-card pl-9"
          />
          {query.search ? (
            <button
              type="button"
              onClick={() => patch({ search: "" })}
              aria-label={tr(copy.clearSearch)}
              className="absolute top-1/2 right-2 grid size-6 -translate-y-1/2 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          ) : null}
        </label>

        <Select
          value={query.sort}
          onValueChange={(value: string | null) => {
            if (value) patch({ sort: value as SortId });
          }}
        >
          <SelectTrigger aria-label={tr(copy.sort)} className="h-10 w-full rounded-xl bg-card md:w-44">
            <ArrowUpDown className="size-4 text-muted-foreground" />
            <SelectValue placeholder={tr(copy.sort)}>
              {(value: string | null) => {
                const sort = SORTS.find((item) => item.id === value);
                return sort ? t(sort.label, locale) : null;
              }}
            </SelectValue>
          </SelectTrigger>
          <SelectContent align="end">
            {SORTS.map((sort) => (
              <SelectItem key={sort.id} value={sort.id}>
                {t(sort.label, locale)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="no-scrollbar -mx-4 flex items-center gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
        <span className="shrink-0 text-xs text-muted-foreground">{tr(copy.monthlyCap)}</span>
        {[...BUDGET_CAPS, null].map((cap: BudgetCap) => (
          <Chip
            key={cap ?? "any"}
            active={query.budget === cap}
            onClick={() => patch({ budget: cap })}
          >
            {cap === null ? tr(copy.unlimited) : `≤ ${cny(cap)}`}
          </Chip>
        ))}
        <span className="mx-1 h-5 w-px shrink-0 bg-border" aria-hidden />
        {QUALITY_CHIPS.map((chip) => (
          <Chip
            key={chip.id}
            active={query.quality.includes(chip.id)}
            onClick={() => toggleQuality(chip.id)}
            title={`${t(chip.label, locale)} · ${chip.min}/5`}
          >
            {t(chip.label, locale)}
          </Chip>
        ))}
        {isFiltered(query) ? (
          <button
            type="button"
            onClick={() => patch({ search: "", budget: null, quality: [] })}
            className="shrink-0 rounded-full px-2.5 py-1 text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            {tr(copy.clearFilters)}
          </button>
        ) : null}
      </div>

      <p className="text-sm text-muted-foreground" aria-live="polite">
        {fmt(copy.resultCount, { n: results.length, noun, sort: sortLabel })}
      </p>

      {results.length > 0 ? (
        <div
          key={query.view}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {results.map((item, index) => (
            <DiscoverCard key={item.slug} item={item} index={index} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center rounded-2xl border border-dashed bg-card/70 px-6 py-14 text-center">
          <span className="mb-3 grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
            <SearchX className="size-5" />
          </span>
          <p className="font-medium tracking-tight">{fmt(copy.noResults, { noun })}</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">{tr(copy.noResultsHint)}</p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {otherCount > 0 ? (
              <Button variant="outline" onClick={() => patch({ view: otherView })}>
                {fmt(copy.otherViewHas, { label: otherLabel, n: otherCount })}
              </Button>
            ) : null}
            <Button onClick={() => setQuery({ ...DEFAULT_QUERY, view: query.view })}>
              {tr(copy.clearAll)}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function Chip({
  active,
  onClick,
  title,
  children,
}: {
  active: boolean;
  onClick: () => void;
  title?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      title={title}
      className={cn(
        "shrink-0 rounded-full border px-3 py-1 text-sm transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-foreground hover:border-primary/50 hover:bg-primary/5",
      )}
    >
      {children}
    </button>
  );
}
