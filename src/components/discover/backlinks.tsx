import Link from "next/link";
import { copy, fill } from "@/lib/copy";
import { COUNTRIES, flagOf } from "@/lib/countries";
import { LANDING_STEP_META, SPOT_META, type PlaceSlug } from "@/lib/domain";
import { t, type Locale } from "@/lib/locale";
import { notesForPlace } from "@/lib/marks";
import { backlinksFor } from "@/data";

export function Backlinks({ slug, locale }: { slug: PlaceSlug; locale: Locale }) {
  const links = backlinksFor(slug);
  const notes = notesForPlace(slug);

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
        {notes.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">{t(copy.noNotes, locale)}</p>
        ) : (
          <ul className="mt-2 space-y-3">
            {notes.map((note) => {
              const country = note.country && COUNTRIES[note.country] ? COUNTRIES[note.country][locale] : "";
              return (
                <li key={note.id}>
                  <Link
                    href={`/campus/${note.campusSlug}#landing-${note.itemId}`}
                    className="text-sm underline decoration-dotted underline-offset-4 hover:text-primary"
                  >
                    {t(LANDING_STEP_META[note.itemId], locale)}
                  </Link>
                  <p className="mt-1 text-xs text-muted-foreground">
                    <span>{note.displayName}</span>
                    {country ? (
                      <span>
                        {" · "}
                        {flagOf(note.country)} {country}
                      </span>
                    ) : null}
                    {note.arrivalYear ? (
                      <span> · {fill(copy.arrivedYear, locale, { n: note.arrivalYear })}</span>
                    ) : null}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed">{note.body}</p>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-sm font-medium">{t(copy.events, locale)}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{t(copy.noEvents, locale)}</p>
      </section>
    </div>
  );
}
