"use client";

import { useEffect, useState } from "react";
import { useT } from "@/components/site/locale-switch";
import { copy } from "@/lib/copy";
import { cn } from "@/lib/utils";

export type SectionLink = { id: string; label: string };

export function SectionNav({ items }: { items: readonly SectionLink[] }) {
  const { t } = useT();
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const visible = new Map<string, boolean>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) visible.set(entry.target.id, entry.isIntersecting);
        const first = items.find((item) => visible.get(item.id));
        if (first) setActive(first.id);
      },
      { rootMargin: "-120px 0px -45% 0px" },
    );
    for (const item of items) {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [items]);

  return (
    <nav
      aria-label={t(copy.pageNav)}
      className="sticky top-16 z-30 -mx-4 min-w-0 border-y border-border/70 bg-background/85 px-4 backdrop-blur-md sm:mx-0 sm:rounded-xl sm:border sm:px-2"
    >
      <ul className="no-scrollbar flex gap-1 overflow-x-auto py-2">
        {items.map((item) => (
          <li key={item.id} className="shrink-0">
            <a
              href={`#${item.id}`}
              aria-current={active === item.id ? "location" : undefined}
              className={cn(
                "block rounded-lg px-3 py-1.5 text-sm whitespace-nowrap transition-colors",
                active === item.id
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
