import type { Place } from "@/lib/domain";
import { cn } from "@/lib/utils";

/** Official URI schemes only. No map SDK. */
export function mapLinks(place: Place): { amap: string; baidu: string; google: string } {
  const name = encodeURIComponent(place.name);
  const address = encodeURIComponent(place.address);
  return {
    amap: `https://uri.amap.com/marker?position=${place.lng},${place.lat}&name=${name}&src=nihaocampus&coordinate=gaode`,
    baidu: `https://api.map.baidu.com/marker?location=${place.lat},${place.lng}&title=${name}&content=${address}&output=html&coord_type=gcj02&src=webapp.nihaocampus.place`,
    google: `https://www.google.com/maps/search/?api=1&query=${place.lat}%2C${place.lng}`,
  };
}

const LINKS = [
  { key: "amap", zh: "高德" },
  { key: "baidu", zh: "百度" },
  { key: "google", zh: "Google Maps" },
] as const;

export function PlaceLinks({ place, className }: { place: Place; className?: string }) {
  const hrefs = mapLinks(place);
  return (
    <div
      role="group"
      aria-label="在地图里打开"
      className={cn("grid grid-cols-3 gap-2", className)}
    >
      {LINKS.map((link) => (
        <a
          key={link.key}
          href={hrefs[link.key]}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-w-0 items-center justify-center rounded-lg border bg-background px-2 py-1.5 text-center text-xs font-medium hover:border-foreground/40 hover:bg-muted"
        >
          {link.zh}
        </a>
      ))}
    </div>
  );
}
