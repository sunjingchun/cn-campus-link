import type { Campus, CampusSlug, City, CitySlug, CityPack, Room } from "@/lib/domain";
import { beijing } from "./cities/beijing";
import { chengdu } from "./cities/chengdu";
import { hangzhou } from "./cities/hangzhou";
import { nanjing } from "./cities/nanjing";
import { shanghai } from "./cities/shanghai";
import { xian } from "./cities/xian";

/**
 * The content registry. A campus belongs to exactly one city because it sits in
 * that city's pack, so there is no parallel `campusSlugs` list to keep in sync.
 */
export const CITY_PACKS: readonly CityPack[] = [
  nanjing,
  shanghai,
  beijing,
  hangzhou,
  chengdu,
  xian,
];

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
