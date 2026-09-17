"use client";

import { useT } from "@/components/site/locale-switch";
import { copy } from "@/lib/copy";
import { cn } from "@/lib/utils";

export function ProgressRing({
  done,
  total,
  className,
}: {
  done: number;
  total: number;
  className?: string;
}) {
  const { fill } = useT();
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const ratio = total === 0 ? 0 : Math.min(1, done / total);
  const offset = circumference * (1 - ratio);
  const label = fill(copy.progressOf, { done, total });

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <svg viewBox="0 0 40 40" className="size-12 -rotate-90" aria-hidden>
        <circle cx="20" cy="20" r={radius} fill="none" className="stroke-muted" strokeWidth="4" />
        <circle
          cx="20"
          cy="20"
          r={radius}
          fill="none"
          className="stroke-primary transition-[stroke-dashoffset]"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <p className="text-sm font-medium tabular-nums" data-progress-ring aria-label={label}>
        {label}
      </p>
    </div>
  );
}
