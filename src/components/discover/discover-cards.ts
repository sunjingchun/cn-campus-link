import {
  overallScore,
  type Campus,
  type CardArt,
  type City,
  type Scorecard,
  type ScoreKey,
} from "@/lib/domain";

/**
 * The compact shape the home grid filters, sorts and draws. Built on the server
 * from a City or Campus, small enough to hand to the client as props. Anything
 * the grid never shows stays out of it.
 */
type Facets = {
  /** 0-100, from overallScore. */
  score: number;
  /** Frugal monthly budget in CNY. The number a student compares against. */
  frugal: number;
  comfortable: number;
  scores: Scorecard;
  members: number;
  haystack: string;
};

export type CityItem = Facets & {
  kind: "city";
  slug: string;
  href: string;
  name: string;
  nameEn: string;
  province: string;
  tagline: string;
  taglineEn: string;
  art: CardArt;
  campusCount: number;
};

export type CampusItem = Facets & {
  kind: "campus";
  slug: string;
  href: string;
  university: string;
  universityEn: string;
  campusName: string;
  campusNameEn: string;
  city: string;
  cityEn: string;
  tagline: string;
  taglineEn: string;
  art: CardArt;
  internationalStudents: number;
  countries: number;
};

export type DiscoverItem = CityItem | CampusItem;

function fold(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function cityItem(city: City, campuses: readonly Campus[]): CityItem {
  return {
    kind: "city",
    slug: city.slug,
    href: `/city/${city.slug}`,
    name: city.name,
    nameEn: city.nameEn,
    province: city.province,
    tagline: city.tagline,
    taglineEn: city.taglineEn,
    art: city.art,
    campusCount: campuses.length,
    score: overallScore(city.scores),
    frugal: city.budget.frugal,
    comfortable: city.budget.comfortable,
    scores: city.scores,
    members: 0,
    haystack: fold(
      [
        city.name,
        city.nameEn,
        city.pinyin,
        city.province,
        city.tagline,
        city.taglineEn,
        ...campuses.map((campus) => campus.facts.university),
      ].join(" "),
    ),
  };
}

export function campusItem(campus: Campus, city: City): CampusItem {
  const { facts } = campus;
  return {
    kind: "campus",
    slug: campus.slug,
    href: `/campus/${campus.slug}`,
    university: facts.university,
    universityEn: facts.universityEn,
    campusName: facts.campusName,
    campusNameEn: facts.campusNameEn,
    city: city.name,
    cityEn: city.nameEn,
    tagline: campus.tagline,
    taglineEn: campus.taglineEn,
    art: campus.art,
    internationalStudents: facts.internationalStudents,
    countries: facts.countries,
    score: overallScore(campus.scores),
    frugal: campus.budget.frugal,
    comfortable: campus.budget.comfortable,
    scores: campus.scores,
    members: 0,
    haystack: fold(
      [
        facts.university,
        facts.universityEn,
        facts.campusName,
        facts.campusNameEn,
        city.name,
        city.nameEn,
        city.pinyin,
        campus.tagline,
        campus.taglineEn,
      ].join(" "),
    ),
  };
}

export const VIEWS = [
  { id: "city", label: "按城市", noun: "城市", en: "Cities" },
  { id: "campus", label: "按校区", noun: "校区", en: "Campuses" },
] as const;
export type ViewId = (typeof VIEWS)[number]["id"];

/** Monthly CNY caps a card's frugal budget must fit under. `null` is 不限. */
export const BUDGET_CAPS = [2500, 4000] as const;
export type BudgetCap = (typeof BUDGET_CAPS)[number] | null;

/** A quality chip is a floor on one score. 4 of 5 is where "friendly" starts. */
export const QUALITY_CHIPS = [
  { id: "english", label: "英语友好", en: "English OK", key: "english", min: 4 },
  { id: "community", label: "国际生多", en: "Big intl. crowd", key: "community", min: 4 },
  { id: "transit", label: "交通方便", en: "Easy transit", key: "transit", min: 4 },
] as const satisfies readonly { id: string; label: string; en: string; key: ScoreKey; min: number }[];
export type QualityId = (typeof QUALITY_CHIPS)[number]["id"];

export const SORTS = [
  { id: "score", label: "综合评分", en: "Overall" },
  { id: "cost", label: "生活成本", en: "Cheapest first" },
  { id: "community", label: "国际生氛围", en: "Intl. community" },
] as const;
export type SortId = (typeof SORTS)[number]["id"];

const COMPARE: Readonly<Record<SortId, (a: Facets, b: Facets) => number>> = {
  score: (a, b) => b.score - a.score,
  cost: (a, b) => a.frugal - b.frugal || b.score - a.score,
  community: (a, b) => b.scores.community - a.scores.community || b.score - a.score,
};

export type DiscoverQuery = {
  view: ViewId;
  search: string;
  budget: BudgetCap;
  quality: readonly QualityId[];
  sort: SortId;
};

export const DEFAULT_QUERY: DiscoverQuery = {
  view: "city",
  search: "",
  budget: null,
  quality: [],
  sort: "score",
};

export function isFiltered(query: DiscoverQuery): boolean {
  return query.search.trim() !== "" || query.budget !== null || query.quality.length > 0;
}

export function applyQuery(items: readonly DiscoverItem[], query: DiscoverQuery): DiscoverItem[] {
  const terms = fold(query.search).split(/\s+/).filter(Boolean);
  const floors = QUALITY_CHIPS.filter((chip) => query.quality.includes(chip.id));
  return items
    .filter(
      (item) =>
        item.kind === query.view &&
        (query.budget === null || item.frugal <= query.budget) &&
        floors.every((chip) => item.scores[chip.key] >= chip.min) &&
        terms.every((term) => item.haystack.includes(term)),
    )
    .sort(COMPARE[query.sort]);
}
