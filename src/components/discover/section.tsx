import { Info } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Notice({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-start gap-2 rounded-xl border border-dashed bg-card/60 px-4 py-2.5 text-xs leading-relaxed text-muted-foreground">
      <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
      <span>{children}</span>
    </p>
  );
}

export function Section({
  id,
  title,
  en,
  lead,
  aside,
  className,
  children,
}: {
  id?: string;
  title: string;
  en?: string;
  lead?: ReactNode;
  aside?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className={cn("scroll-mt-32", className)}>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <div className="min-w-0">
          <h2 className="flex flex-wrap items-baseline gap-x-2.5 text-xl font-semibold tracking-tight sm:text-2xl">
            {title}
            {en ? <span className="text-sm font-normal text-muted-foreground">{en}</span> : null}
          </h2>
          {lead ? <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{lead}</p> : null}
        </div>
        {aside}
      </div>
      {children}
    </section>
  );
}
