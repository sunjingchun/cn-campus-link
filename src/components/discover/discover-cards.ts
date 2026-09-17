import { copy } from "@/lib/copy";
import {
  overallScore,
  type Campus,
  type CardArt,
  type City,
  type Scorecard,
  type ScoreKey,
} from "@/lib/domain";
import { t, type Locale, type Localized } from "@/lib/locale";

type Facets = {
  score: number;
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
  province: string;
  tagline: string;
  art: CardArt;
  campusCount: number;
};

export type CampusItem = Facets & {
  kind: "campus";
  slug: string;
  href: string;
  university: string;
  campusName: string;
  city: string;
  tagline: string;
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

function both(value: Localized): string {
  return `${value.zh} ${value.en}`;
}

export function cityItem(city: City, campuses: readonly Campus[], locale: Locale): CityItem {
  return {
    kind: "city",
    slug: city.slug,
    href: `/city/${city.slug}`,
    name: t(city.name, locale),
    province: t(city.province, locale),
    tagline: t(city.tagline, locale),
    art: city.art,
    campusCount: campuses.length,
    score: overallScore(city.scores),
    frugal: city.budget.frugal,
    comfortable: city.budget.comfortable,
    scores: city.scores,
    members: 0,
    haystack: fold(
      [
        both(city.name),
        city.pinyin,
        both(city.province),
        both(city.tagline),
        ...campuses.map((campus) => both(campus.facts.university)),
      ].join(" "),
    ),
  };
}

export function campusItem(campus: Campus, city: City, locale: Locale): CampusItem {
  const { facts } = campus;
  return {
    kind: "campus",
    slug: campus.slug,
    href: `/campus/${campus.slug}`,
    university: t(facts.university, locale),
    campusName: t(facts.campusName, locale),
    city: t(city.name, locale),
    tagline: t(campus.tagline, locale),
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
        both(facts.university),
        both(facts.campusName),
        both(city.name),
        city.pinyin,
        both(campus.tagline),
      ].join(" "),
    ),
  };
}

export const VIEWS = [
  { id: "city", label: copy.byCity, noun: copy.nounCity },
  { id: "campus", label: copy.byCampus, noun: copy.nounCampus },
] as const;
export type ViewId = (typeof VIEWS)[number]["id"];

export const BUDGET_CAPS = [2500, 4000] as const;
export type BudgetCap = (typeof BUDGET_CAPS)[number] | null;

export const QUALITY_CHIPS = [
  { id: "english", label: { zh: "英语友好", en: "English OK" }, key: "english", min: 4 },
  { id: "community", label: { zh: "国际生多", en: "Big intl. crowd" }, key: "community", min: 4 },
  { id: "transit", label: { zh: "交通方便", en: "Easy transit" }, key: "transit", min: 4 },
] as const satisfies readonly { id: string; label: Localized; key: ScoreKey; min: number }[];
export type QualityId = (typeof QUALITY_CHIPS)[number]["id"];

export const SORTS = [
  { id: "score", label: copy.overall },
  { id: "cost", label: { zh: "生活成本", en: "Cheapest first" } },
  { id: "community", label: { zh: "国际生氛围", en: "Intl. community" } },
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
