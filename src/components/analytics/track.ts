"use client";

import type { EventName } from "@/lib/domain";

function readUtm(): string | null {
  try {
    return new URLSearchParams(window.location.search).get("utm_source");
  } catch {
    return null;
  }
}

function campusFromPath(path: string): string | null {
  const match = path.match(/^\/campus\/([^/]+)/);
  return match?.[1] ?? null;
}

function referrerOriginPath(): string | null {
  if (!document.referrer) return null;
  return document.referrer.split("?")[0] ?? null;
}

/** Fire-and-forget. Never await this. Failures are silent on purpose. */
export function track(name: EventName, props?: Record<string, string | number | boolean>): void {
  if (typeof window === "undefined") return;
  const path = window.location.pathname;
  const payload = JSON.stringify({
    name,
    path,
    campus_slug: campusFromPath(path),
    locale: document.documentElement.lang || null,
    referrer: referrerOriginPath(),
    utm: readUtm(),
    props: props && Object.keys(props).length > 0 ? props : undefined,
  });
  try {
    const blob = new Blob([payload], { type: "application/json" });
    if (typeof navigator.sendBeacon === "function" && navigator.sendBeacon("/api/events", blob)) {
      return;
    }
    void fetch("/api/events", {
      method: "POST",
      body: payload,
      headers: { "content-type": "application/json" },
      keepalive: true,
    }).catch(() => undefined);
  } catch {
    // Failures stay silent so a blocked beacon cannot take down a click.
  }
}
