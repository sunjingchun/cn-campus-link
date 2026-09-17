import Link from "next/link";
import { copy, fill } from "@/lib/copy";
import { SPOT_META, type PlaceSlug } from "@/lib/domain";
import { t, type Locale } from "@/lib/locale";
import { backlinksFor } from "@/data";

export function Backlinks({ slug, locale }: { slug: PlaceSlug; locale: Locale }) {
  const links = backlinksFor(slug);

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-sm font-medium">{t(copy.landingBacklinks, locale)}</h2>
        {links.landing.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">{t(copy.noLandingBacklinks, locale)}</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {links.landing.map((item) => (
              <li key={`${item.campusSlug}-${item.step}`}>
                <Link
                  href={`/campus/${item.campusSlug}#landing-${item.step}`}
                  className="text-sm underline decoration-dotted underline-offset-4 hover:text-primary"
                >
                  {fill(copy.stepLink, locale, {
                    n: item.stepIndex,
                    step: t(item.stepLabel, locale),
                    campus: t(item.campusLabel, locale),
                  })}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-sm font-medium">{t(copy.spotBacklinks, locale)}</h2>
        {links.spots.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">{t(copy.noSpotBacklinks, locale)}</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {links.spots.map((item) => (
              <li key={`${item.campusSlug}-${item.category}`}>
                <Link
                  href={`/campus/${item.campusSlug}#spots`}
                  className="text-sm underline decoration-dotted underline-offset-4 hover:text-primary"
                >
                  {t(item.campusLabel, locale)} · {t(SPOT_META[item.category], locale)}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-sm font-medium">{t(copy.notes, locale)}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{t(copy.noNotes, locale)}</p>
      </section>

      <section>
        <h2 className="text-sm font-medium">{t(copy.events, locale)}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{t(copy.noEvents, locale)}</p>
      </section>
    </div>
  );
}
