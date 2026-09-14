import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/** Native details/summary: works without JavaScript and is keyboard accessible as-is. */
export function Faq({ items, className }: { items: readonly { q: string; a: string }[]; className?: string }) {
  return (
    <div className={cn("divide-y overflow-hidden rounded-2xl border bg-card", className)}>
      {items.map((item, index) => (
        <details key={item.q} className="group" open={index === 0}>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-left font-medium tracking-tight transition-colors outline-none hover:bg-muted/50 focus-visible:bg-muted/50 [&::-webkit-details-marker]:hidden">
            <span>{item.q}</span>
            <ChevronDown
              className="size-4 shrink-0 text-muted-foreground transition-transform duration-300 group-open:rotate-180"
              aria-hidden
            />
          </summary>
          <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
        </details>
      ))}
    </div>
  );
}
