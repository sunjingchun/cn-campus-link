"use client";

import { ArrowUpDown, Search, SearchX, X } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cny } from "@/lib/domain";
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

  const noun = VIEWS.find((view) => view.id === query.view)?.noun ?? "";
  const otherLabel = VIEWS.find((view) => view.id === otherView)?.label ?? "";
  const sortLabel = SORTS.find((sort) => sort.id === query.sort)?.label ?? "";

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div
          role="group"
          aria-label="查看方式"
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
              {view.label}
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
            placeholder={
              query.view === "city"
                ? "搜城市、省份或拼音，例如 南京 / Nanjing"
                : "搜大学、校区或城市，例如 东南大学 / SEU"
            }
            aria-label="搜索"
            className="h-10 rounded-xl bg-card pl-9"
          />
          {query.search ? (
            <button
              type="button"
              onClick={() => patch({ search: "" })}
              aria-label="清除搜索"
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
          <SelectTrigger aria-label="排序" className="h-10 w-full rounded-xl bg-card md:w-44">
            <ArrowUpDown className="size-4 text-muted-foreground" />
            <SelectValue placeholder="排序">
              {(value: string | null) => SORTS.find((sort) => sort.id === value)?.label ?? null}
            </SelectValue>
          </SelectTrigger>
          <SelectContent align="end">
            {SORTS.map((sort) => (
              <SelectItem key={sort.id} value={sort.id}>
                {sort.label}
                <span className="text-xs text-muted-foreground">{sort.en}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="no-scrollbar -mx-4 flex items-center gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
        <span className="shrink-0 text-xs text-muted-foreground">月预算</span>
        {[...BUDGET_CAPS, null].map((cap: BudgetCap) => (
          <Chip
            key={cap ?? "any"}
            active={query.budget === cap}
            onClick={() => patch({ budget: cap })}
          >
            {cap === null ? "不限" : `≤ ${cny(cap)}`}
          </Chip>
        ))}
        <span className="mx-1 h-5 w-px shrink-0 bg-border" aria-hidden />
        {QUALITY_CHIPS.map((chip) => (
          <Chip
            key={chip.id}
            active={query.quality.includes(chip.id)}
            onClick={() => toggleQuality(chip.id)}
            title={`${chip.en} · ${chip.min}/5 以上`}
          >
            {chip.label}
          </Chip>
        ))}
        {isFiltered(query) ? (
          <button
            type="button"
            onClick={() => patch({ search: "", budget: null, quality: [] })}
            className="shrink-0 rounded-full px-2.5 py-1 text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            清除筛选
          </button>
        ) : null}
      </div>

      <p className="text-sm text-muted-foreground" aria-live="polite">
        <span className="font-medium text-foreground tabular-nums">{results.length}</span> 个{noun} ·
        按{sortLabel}排序
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
          <p className="font-medium tracking-tight">没有符合这些条件的{noun}</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            放宽预算、去掉一个筛选，或者换个关键词试试。
            <br />
            Nothing matches these filters yet.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {otherCount > 0 ? (
              <Button variant="outline" onClick={() => patch({ view: otherView })}>
                {otherLabel}里有 {otherCount} 个结果
              </Button>
            ) : null}
            <Button onClick={() => setQuery({ ...DEFAULT_QUERY, view: query.view })}>
              清除全部筛选
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
