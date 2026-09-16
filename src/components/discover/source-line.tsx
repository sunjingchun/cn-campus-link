import { BadgeCheck, TriangleAlert } from "lucide-react";
import type { Source } from "@/lib/domain";
import { cn } from "@/lib/utils";

const KIND_LABEL: Readonly<Record<Source["kind"], string>> = {
  official: "官方来源",
  university: "高校国际处",
  secondary: "第三方整理",
};

/**
 * Three tiers of colour, ordered by how much the reader should worry. A checked
 * claim is calm, an unchecked one is amber, and red stays reserved for the real
 * penalties in `warning`. Reversing any of these tells the reader the opposite
 * of what the data says.
 */
export function SourceLine({
  sources,
  unverified,
  className,
}: {
  sources?: Source[];
  unverified: string;
  className?: string;
}) {
  if (!sources || sources.length === 0) {
    return (
      <p
        className={cn(
          "flex flex-wrap items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400",
          className,
        )}
      >
        <TriangleAlert className="size-3.5 shrink-0" aria-hidden />
        {unverified}
      </p>
    );
  }
  return (
    <p
      className={cn(
        "flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground",
        className,
      )}
    >
      <BadgeCheck className="size-3.5 shrink-0 text-emerald-600 dark:text-emerald-500" aria-hidden />
      {sources.map((source) => (
        <a
          key={source.url}
          href={source.url}
          target="_blank"
          rel="noreferrer"
          className="underline decoration-dotted underline-offset-4 hover:text-foreground"
        >
          {`${KIND_LABEL[source.kind]} 核验于 ${source.checkedOn}`}
        </a>
      ))}
    </p>
  );
}
