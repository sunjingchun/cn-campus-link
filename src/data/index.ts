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

export function campusLabel(campus: Campus): string {
  return `${campus.facts.university} · ${campus.facts.campusName}`;
}

/** Campus picker options. Keeps the whole content bundle out of client code. */
export type CampusOption = { slug: string; label: string; city: string };

export function campusOptions(): CampusOption[] {
  return CITY_PACKS.flatMap((pack) =>
    pack.campuses.map((campus) => ({
      slug: campus.slug as string,
      label: `${campus.facts.university} ${campus.facts.campusName}`,
      city: pack.city.name,
    })),
  );
}

/** A room only exists if the city or campus behind it does. */
export function roomExists(room: Room): boolean {
  return room.kind === "city" ? cityBySlug.has(room.city) : campusBySlug.has(room.campus);
}

export function roomTitle(room: Room): string {
  if (room.kind === "city") return getCity(room.city)?.name ?? room.city;
  const campus = getCampus(room.campus);
  return campus ? campusLabel(campus) : room.campus;
}

export type LandingBacklink = {
  campusSlug: CampusSlug;
  campusLabel: string;
  step: LandingStepId;
  stepZh: string;
  stepIndex: number;
};

export type SpotBacklink = {
  campusSlug: CampusSlug;
  campusLabel: string;
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
    const label = campusLabel(campus);
    for (const [index, step] of LANDING_STEPS.entries()) {
      if (campus.landing[step].place === slug) {
        landing.push({
          campusSlug: campus.slug,
          campusLabel: label,
          step,
          stepZh: LANDING_STEP_META[step].zh,
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
