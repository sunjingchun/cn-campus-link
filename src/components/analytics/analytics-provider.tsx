"use client";

import { usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { track } from "@/components/analytics/track";

const MAP_HREF = /amap\.com|baidu\.com|maps\.google\.|google\.[^/]+\/maps/i;

function pathKind(pathname: string): { campus?: string; place?: string } {
  const parts = pathname.split("/").filter(Boolean);
  if (parts[0] === "campus" && parts[1]) return { campus: parts[1] };
  if (parts[0] === "place" && parts[1]) return { place: parts[1] };
  return {};
}

/**
 * Route events from the pathname, and intent events from clicks, without
 * editing discover components this PR is not allowed to touch.
 */
export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    track("page_view");
    const kind = pathKind(pathname);
    if (kind.campus) track("campus_view", { campus_slug: kind.campus });
    if (kind.place) track("place_view", { place_slug: kind.place });
  }, [pathname]);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const step = target.closest("[id^='landing-']");
      if (step instanceof HTMLElement && step.id.startsWith("landing-")) {
        const stepId = step.id.slice("landing-".length);
        if (stepId) track("step_open", { step: stepId });
      }

      const button = target.closest("button");
      if (button && /复制|已复制/.test(button.textContent ?? "")) {
        track("copy_address");
      }

      const link = target.closest("a");
      const href = link?.href ?? "";
      if (href && MAP_HREF.test(href)) {
        track("map_deeplink", { href });
      }
    }

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return children;
}
