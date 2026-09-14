import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Stat({
  label,
  en,
  value,
  hint,
  className,
}: {
  label: string;
  en?: string;
  value: ReactNode;
  hint?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <dt className="flex flex-wrap items-baseline gap-x-1.5 text-xs text-muted-foreground">
        <span>{label}</span>
        {en ? <span className="text-[11px] opacity-80">{en}</span> : null}
      </dt>
      <dd className="mt-0.5 text-lg font-semibold tabular-nums tracking-tight sm:text-xl">{value}</dd>
      {hint ? <dd className="text-xs text-muted-foreground">{hint}</dd> : null}
    </div>
  );
}

/** Bands the 0-100 overall score into the three words a student actually hears. */
export function scoreBand(score: number): { label: string; className: string } {
  if (score >= 80) return { label: "很好", className: "bg-jade text-white" };
  if (score >= 65) return { label: "不错", className: "bg-amber-500 text-white" };
  return { label: "一般", className: "bg-stone-600 text-white" };
}

export function ScorePill({
  score,
  size = "sm",
  className,
}: {
  score: number;
  size?: "sm" | "lg";
  className?: string;
}) {
  const band = scoreBand(score);
  return (
    <span
      className={cn(
        "inline-flex items-baseline gap-1 rounded-full font-semibold tabular-nums shadow-sm",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-base",
        band.className,
        className,
      )}
      title={`综合评分 ${score} / 100`}
    >
      <span className={size === "sm" ? "text-sm" : "text-2xl"}>{score}</span>
      <span className="font-normal opacity-90">{band.label}</span>
    </span>
  );
}
