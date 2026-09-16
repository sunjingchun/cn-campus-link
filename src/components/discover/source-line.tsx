import { TriangleAlert } from "lucide-react";
import type { Source } from "@/lib/domain";
import { cn } from "@/lib/utils";

const KIND_LABEL: Readonly<Record<Source["kind"], string>> = {
  official: "官方来源",
  university: "高校国际处",
  secondary: "第三方整理",
};

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
      <p className={cn("flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground", className)}>
        <TriangleAlert className="size-3.5 shrink-0 text-amber-600 dark:text-amber-500" aria-hidden />
        {unverified}
      </p>
    );
  }
  return (
    <p className={cn("flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground", className)}>
      {sources.map((source) => (
        <a
          key={source.url}
          href={source.url}
          target="_blank"
          rel="noreferrer"
          className="text-primary underline-offset-4 hover:underline"
        >
          {`${KIND_LABEL[source.kind]} 核验于 ${source.checkedOn}`}
        </a>
      ))}
    </p>
  );
}
