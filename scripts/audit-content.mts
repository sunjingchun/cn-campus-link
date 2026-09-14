/**
 * Structural audit of the city content. The types already guarantee that every
 * field exists; this checks the things a type cannot: that the arrays are deep
 * enough to be useful, that scores actually differ between campuses, and that
 * no two cards share a palette.
 *
 *   npx tsx scripts/audit-content.mts
 */

import { CAMPUSES, CITIES, CITY_PACKS, campusesOfCity, cityOfCampus } from "../src/lib/../data/index.js";
import { LANDING_STEPS, SCORE_KEYS, overallScore, type CardArt } from "../src/lib/domain.js";

const problems: string[] = [];

function want(condition: boolean, message: string) {
  if (!condition) problems.push(message);
}

const palettes = new Map<string, string>();

function palette(art: CardArt, owner: string) {
  const key = `${art.from}|${art.via}|${art.to}`.toLowerCase();
  const existing = palettes.get(key);
  if (existing) problems.push(`palette reused by ${owner} and ${existing}`);
  else palettes.set(key, owner);
}

console.log(`${CITIES.length} cities, ${CAMPUSES.length} campuses\n`);

for (const pack of CITY_PACKS) {
  const { city, campuses } = pack;
  palette(city.art, `city ${city.slug}`);
  want(city.climate.length === 12, `${city.slug}: climate is not twelve months`);
  want(city.climate[0].month === 1, `${city.slug}: climate does not start in January`);
  want(city.highlights.length >= 3, `${city.slug}: fewer than three highlights`);
  want(city.arrivals.length >= 2, `${city.slug}: fewer than two arrival routes`);
  want(campuses.length >= 2, `${city.slug}: fewer than two campuses`);
  want(city.summary.length >= 60, `${city.slug}: summary is thin`);

  const rows = campuses.map((campus) => {
    palette(campus.art, `campus ${campus.slug}`);
    want(
      Object.keys(campus.landing).length === LANDING_STEPS.length,
      `${campus.slug}: landing checklist is incomplete`,
    );
    for (const step of LANDING_STEPS) {
      want(campus.landing[step].bring.length > 0, `${campus.slug}/${step}: nothing to bring`);
      want(campus.landing[step].tips.length > 0, `${campus.slug}/${step}: no tips`);
    }
    want(campus.spots.length >= 8, `${campus.slug}: fewer than eight spots`);
    want(campus.neighborhoods.length >= 3, `${campus.slug}: fewer than three neighbourhoods`);
    want(campus.transport.length >= 4, `${campus.slug}: fewer than four transport legs`);
    want(campus.pros.length >= 4 && campus.cons.length >= 4, `${campus.slug}: thin pros or cons`);
    want(campus.faq.length >= 4, `${campus.slug}: fewer than four FAQ entries`);
    want(cityOfCampus(campus.slug)?.slug === city.slug, `${campus.slug}: city lookup mismatch`);
    want(
      new Set(campus.spots.map((spot) => spot.category)).size >= 4,
      `${campus.slug}: spots cover fewer than four categories`,
    );
    return {
      campus: campus.slug as string,
      score: overallScore(campus.scores),
      budget: campus.budget.comfortable,
      spots: campus.spots.length,
      intl: campus.facts.internationalStudents,
    };
  });

  want(
    campusesOfCity(city.slug).length === campuses.length,
    `${city.slug}: campusesOfCity disagrees with the pack`,
  );

  const fingerprints = new Set(
    campuses.map((campus) => SCORE_KEYS.map((key) => campus.scores[key]).join("")),
  );
  want(
    fingerprints.size === campuses.length,
    `${city.slug}: two campuses share an identical scorecard`,
  );

  console.log(`${city.name} ${city.nameEn}  总分 ${overallScore(city.scores)}`);
  console.table(rows);
}

if (problems.length === 0) {
  console.log("\ncontent audit clean");
} else {
  console.log(`\n${problems.length} problems`);
  for (const problem of problems) console.log(`  - ${problem}`);
  process.exitCode = 1;
}
