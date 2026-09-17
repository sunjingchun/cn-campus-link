import type { ReactNode } from "react";
import { Info } from "lucide-react";
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
  lead,
  aside,
  className,
  children,
}: {
  id?: string;
  title: string;
  lead?: ReactNode;
  aside?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className={cn("scroll-mt-32", className)}>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <div className="min-w-0">
          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">{title}</h2>
          {lead ? <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{lead}</p> : null}
        </div>
        {aside}
      </div>
      {children}
    </section>
  );
}
