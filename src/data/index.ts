import type { Campus, CampusSlug, City, CitySlug, CityPack } from "@/lib/domain";
import { nanjing } from "./cities/nanjing";

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
