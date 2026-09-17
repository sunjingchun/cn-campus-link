import { copy } from "@/lib/copy";
import type { Place } from "@/lib/domain";
import { t, type Locale } from "@/lib/locale";
import { cn } from "@/lib/utils";

export function mapLinks(place: Place): { amap: string; baidu: string; google: string } {
  const name = encodeURIComponent(place.name.zh);
  const address = encodeURIComponent(place.address);
  return {
    amap: `https://uri.amap.com/marker?position=${place.lng},${place.lat}&name=${name}&src=nihaocampus&coordinate=gaode`,
    baidu: `https://api.map.baidu.com/marker?location=${place.lat},${place.lng}&title=${name}&content=${address}&output=html&coord_type=gcj02&src=webapp.nihaocampus.place`,
    google: `https://www.google.com/maps/search/?api=1&query=${place.lat}%2C${place.lng}`,
  };
}

export function PlaceLinks({ place, locale, className }: { place: Place; locale: Locale; className?: string }) {
  const hrefs = mapLinks(place);
  const links = [
    { key: "amap" as const, label: t(copy.amap, locale) },
    { key: "baidu" as const, label: t(copy.baidu, locale) },
    { key: "google" as const, label: t(copy.googleMaps, locale) },
  ];
  return (
    <div
      role="group"
      aria-label={t(copy.maps, locale)}
      className={cn("grid grid-cols-3 gap-2", className)}
    >
      {links.map((link) => (
        <a
          key={link.key}
          href={hrefs[link.key]}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-w-0 items-center justify-center rounded-lg border bg-background px-2 py-1.5 text-center text-xs font-medium hover:border-foreground/40 hover:bg-muted"
        >
          {link.label}
        </a>
      ))}
    </div>
  );
}
