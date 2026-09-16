/**
 * Coverage audit for required `sources` arrays.
 *
 * Default: print counts by place and landing step, then exit 0.
 * `--require-campus <slug>`: fail if any of that campus's nine steps or their
 * places has an empty array or a `checkedOn` older than 12 months.
 * `--self-test empty|expired`: run the fail path against a constructed fixture.
 *
 *   npx tsx scripts/audit-sources.mts
 *   npx tsx scripts/audit-sources.mts --require-campus nju-xianlin
 *   npx tsx scripts/audit-sources.mts --self-test empty
 */

import { CAMPUSES, PLACE_LIST, getCampus, requirePlace } from "../src/data/index.js";
import { LANDING_STEPS, type Place, type Source } from "../src/lib/domain.js";

const TWELVE_MONTHS_MS = 365 * 24 * 60 * 60 * 1000;

type Finding = { owner: string; reason: "empty" | "expired"; detail?: string };

function parseArgs(argv: string[]) {
  let requireCampus: string | null = null;
  let selfTest: "empty" | "expired" | null = null;
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--require-campus") {
      requireCampus = argv[i + 1] ?? "";
      i += 1;
    } else if (arg === "--self-test") {
      const value = argv[i + 1];
      if (value === "empty" || value === "expired") selfTest = value;
      else {
        console.error(`unknown --self-test ${value ?? "(missing)"}`);
        process.exit(2);
      }
      i += 1;
    }
  }
  return { requireCampus, selfTest };
}

function isExpired(source: Source, now: number): boolean {
  const stamp = Date.parse(source.checkedOn);
  return Number.isNaN(stamp) || now - stamp > TWELVE_MONTHS_MS;
}

function findingsForSources(owner: string, sources: Source[] | undefined, now: number): Finding[] {
  if (!sources || sources.length === 0) return [{ owner, reason: "empty" }];
  return sources
    .filter((source) => isExpired(source, now))
    .map((source) => ({ owner, reason: "expired" as const, detail: source.checkedOn }));
}

function printPlaceRow(place: Place): void {
  const kinds = place.sources.map((source) => source.kind).join(",") || "-";
  console.log(`${place.slug}\t${place.sources.length}\t${kinds}`);
}

function printDefault(): void {
  const byKind = { official: 0, university: 0, secondary: 0 };
  let sourced = 0;
  let empty = 0;
  console.log("places");
  for (const place of PLACE_LIST) {
    printPlaceRow(place);
    if (place.sources.length === 0) empty += 1;
    else sourced += 1;
    for (const source of place.sources) byKind[source.kind] += 1;
  }

  let stepSourced = 0;
  let stepEmpty = 0;
  console.log("\nlanding steps");
  for (const campus of CAMPUSES) {
    for (const step of LANDING_STEPS) {
      const sources = campus.landing[step].sources ?? [];
      const kinds = sources.map((source) => source.kind).join(",") || "-";
      console.log(`${campus.slug}/${step}\t${sources.length}\t${kinds}`);
      if (sources.length === 0) stepEmpty += 1;
      else stepSourced += 1;
      for (const source of sources) byKind[source.kind] += 1;
    }
  }

  console.log(
    `\nplaces sourced=${sourced} empty=${empty}; landing sourced=${stepSourced} empty=${stepEmpty}; kinds official=${byKind.official} university=${byKind.university} secondary=${byKind.secondary}`,
  );
}

function campusFindings(slug: string, now: number): Finding[] {
  const campus = getCampus(slug);
  if (!campus) {
    console.error(`unknown campus ${slug}`);
    process.exit(2);
  }
  const findings: Finding[] = [];
  for (const step of LANDING_STEPS) {
    const landing = campus.landing[step];
    findings.push(...findingsForSources(`${slug}/${step}`, landing.sources, now));
    const place = requirePlace(landing.place);
    findings.push(...findingsForSources(`${slug}/${step} place:${place.slug}`, place.sources, now));
  }
  return findings;
}

function failIf(findings: Finding[], label: string): void {
  if (findings.length === 0) {
    console.log(`${label}: ok`);
    return;
  }
  for (const finding of findings) {
    const extra = finding.detail ? ` ${finding.detail}` : "";
    console.error(`${finding.owner}\t${finding.reason}${extra}`);
  }
  process.exitCode = 1;
}

function selfTest(kind: "empty" | "expired"): void {
  const now = Date.parse("2026-09-17T00:00:00Z");
  const empty: Source[] = [];
  const expired: Source[] = [{ url: "https://example.test/expired", checkedOn: "2024-09-16", kind: "official" }];
  const findings =
    kind === "empty"
      ? findingsForSources("self-test", empty, now)
      : findingsForSources("self-test", expired, now);
  failIf(findings, `--self-test ${kind}`);
}

const args = parseArgs(process.argv.slice(2));

if (args.selfTest) {
  selfTest(args.selfTest);
} else if (args.requireCampus !== null) {
  if (!args.requireCampus) {
    console.error("--require-campus needs a campus slug");
    process.exit(2);
  }
  failIf(campusFindings(args.requireCampus, Date.now()), `--require-campus ${args.requireCampus}`);
} else {
  printDefault();
}
