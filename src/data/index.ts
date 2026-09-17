import {
  LANDING_STEPS,
  LANDING_STEP_META,
  type Campus,
  type CampusSlug,
  type City,
  type CitySlug,
  type CityPack,
  type LandingStepId,
  type PlaceSlug,
  type Room,
  type SpotCategory,
} from "@/lib/domain";
import { t, type Locale, type Localized } from "@/lib/locale";
import { nanjing } from "./cities/nanjing";
import { requirePlace } from "./places";

/**
 * The content registry. A campus belongs to exactly one city because it sits in
 * that city's pack, so there is no parallel `campusSlugs` list to keep in sync.
 */
export const CITY_PACKS: readonly CityPack[] = [nanjing];

export const CITIES: readonly City[] = CITY_PACKS.map((pack) => pack.city);

export const CAMPUSES: readonly Campus[] = CITY_PACKS.flatMap((pack) => pack.campuses);

const cityBySlug = new Map<string, City>(CITIES.map((city) => [city.slug, city]));
const campusBySlug = new Map<string, Campus>(CAMPUSES.map((campus) => [campus.slug, campus]));
const campusesByCity = new Map<string, Campus[]>(
  CITY_PACKS.map((pack) => [pack.city.slug, pack.campuses]),
);
const cityByCampus = new Map<string, City>(
  CITY_PACKS.flatMap((pack) => pack.campuses.map((campus) => [campus.slug, pack.city] as const)),
);

if (campusBySlug.size !== CAMPUSES.length || cityBySlug.size !== CITIES.length) {
  throw new Error("Duplicate city or campus slug in src/data/cities");
}

export function getCity(slug: string): City | undefined {
  return cityBySlug.get(slug);
}

export function getCampus(slug: string): Campus | undefined {
  return campusBySlug.get(slug);
}

export function campusesOfCity(slug: CitySlug): readonly Campus[] {
  return campusesByCity.get(slug) ?? [];
}

export function cityOfCampus(slug: CampusSlug): City | undefined {
  return cityByCampus.get(slug);
}

export function campusLabel(campus: Campus, locale: Locale = "en"): string {
  return `${t(campus.facts.university, locale)} · ${t(campus.facts.campusName, locale)}`;
}

/** Campus picker options. Keeps the whole content bundle out of client code. */
export type CampusOption = { slug: string; label: Localized; city: Localized };

export function campusOptions(): CampusOption[] {
  return CITY_PACKS.flatMap((pack) =>
    pack.campuses.map((campus) => ({
      slug: campus.slug as string,
      label: {
        zh: `${campus.facts.university.zh} ${campus.facts.campusName.zh}`,
        en: `${campus.facts.university.en} ${campus.facts.campusName.en}`,
      },
      city: pack.city.name,
    })),
  );
}

/** A room only exists if the city or campus behind it does. */
export function roomExists(room: Room): boolean {
  return room.kind === "city" ? cityBySlug.has(room.city) : campusBySlug.has(room.campus);
}

export function roomTitle(room: Room, locale: Locale = "en"): string {
  if (room.kind === "city") {
    const city = getCity(room.city);
    return city ? t(city.name, locale) : room.city;
  }
  const campus = getCampus(room.campus);
  return campus ? campusLabel(campus, locale) : room.campus;
}

export type LandingBacklink = {
  campusSlug: CampusSlug;
  campusLabel: Localized;
  step: LandingStepId;
  stepLabel: Localized;
  stepIndex: number;
};

export type SpotBacklink = {
  campusSlug: CampusSlug;
  campusLabel: Localized;
  category: SpotCategory;
};

export type PlaceBacklinks = {
  landing: LandingBacklink[];
  spots: SpotBacklink[];
  experiences: readonly [];
  events: readonly [];
};

export function backlinksFor(slug: PlaceSlug): PlaceBacklinks {
  const landing: LandingBacklink[] = [];
  const spots: SpotBacklink[] = [];
  for (const campus of CAMPUSES) {
    const label = {
      zh: campusLabel(campus, "zh"),
      en: campusLabel(campus, "en"),
    };
    for (const [index, step] of LANDING_STEPS.entries()) {
      if (campus.landing[step].place === slug) {
        landing.push({
          campusSlug: campus.slug,
          campusLabel: label,
          step,
          stepLabel: LANDING_STEP_META[step],
          stepIndex: index + 1,
        });
      }
    }
    for (const spot of campus.spots) {
      if (spot.place === slug) {
        spots.push({ campusSlug: campus.slug, campusLabel: label, category: spot.category });
      }
    }
  }
  return { landing, spots, experiences: [], events: [] };
}

function assertPlacesResolved(): void {
  for (const campus of CAMPUSES) {
    requirePlace(campus.visaOffice);
    for (const step of LANDING_STEPS) requirePlace(campus.landing[step].place);
    for (const spot of campus.spots) requirePlace(spot.place);
  }
}

assertPlacesResolved();

export { getPlace, requirePlace, NANJING_VISA_HALLS, PLACE_LIST, PLACES } from "./places";
