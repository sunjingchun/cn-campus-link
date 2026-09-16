// Throwaway census. Scores each campus block by how specific its content is.
// Specificity signals: a street number in an address, a non-null fee, a non-null
// duration, a warning, and tips that name a place or a number rather than advice.
import fs from "node:fs";
import path from "node:path";

const dir = "/Users/jc/Desktop/workspace/cn-campus-link/src/data/cities";

const HAS_STREET_NUMBER = /\d+\s*号/;
const HEDGE = /(以.*通知为准|以.*为准|具体.*咨询|均有|详见|请咨询|参考|视.*而定)/;
const NUMBER_OR_PLACE = /(\d|门|路|街|楼|号|栋|区|站)/;

function campusBlocks(source) {
  const marks = [...source.matchAll(/slug: campusSlug\("([^"]+)"\)/g)];
  return marks.map((m, i) => ({
    slug: m[1],
    body: source.slice(m.index, i + 1 < marks.length ? marks[i + 1].index : source.length),
  }));
}

const rows = [];
for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".ts"))) {
  const source = fs.readFileSync(path.join(dir, file), "utf8");
  for (const { slug, body } of campusBlocks(source)) {
    const addresses = [...body.matchAll(/address: "([^"]*)"/g)].map((m) => m[1]);
    const tips = [...body.matchAll(/^\s{8,}"([^"]{6,})",?$/gm)].map((m) => m[1]);
    rows.push({
      file,
      slug,
      lines: body.split("\n").length,
      addresses: addresses.length,
      withStreetNumber: addresses.filter((a) => HAS_STREET_NUMBER.test(a)).length,
      hedged: addresses.filter((a) => HEDGE.test(a)).length,
      fees: [...body.matchAll(/feeCny: (\d+)/g)].length,
      feesNull: [...body.matchAll(/feeCny: null/g)].length,
      warnings: [...body.matchAll(/warning:/g)].length,
      spots: [...body.matchAll(/category: "/g)].length,
      concreteTips: tips.filter((t) => NUMBER_OR_PLACE.test(t) && !HEDGE.test(t)).length,
      hedgedTips: tips.filter((t) => HEDGE.test(t)).length,
    });
  }
}

const score = (r) =>
  r.withStreetNumber * 3 + r.fees * 2 + r.warnings * 2 + r.concreteTips - r.hedged * 3 - r.hedgedTips * 2;

rows.sort((a, b) => score(b) - score(a));
console.log("slug".padEnd(22), "city-file".padEnd(14), "lines", "addr", "street#", "hedged", "fee", "warn", "spots", "tips+", "tips?", "score");
for (const r of rows) {
  console.log(
    r.slug.padEnd(22),
    r.file.replace(".ts", "").padEnd(14),
    String(r.lines).padStart(5),
    String(r.addresses).padStart(4),
    String(r.withStreetNumber).padStart(7),
    String(r.hedged).padStart(6),
    String(r.fees).padStart(3),
    String(r.warnings).padStart(4),
    String(r.spots).padStart(5),
    String(r.concreteTips).padStart(5),
    String(r.hedgedTips).padStart(5),
    String(score(r)).padStart(5),
  );
}
console.log(`\n${rows.length} campuses across ${new Set(rows.map((r) => r.file)).size} city files`);
const byCity = {};
for (const r of rows) (byCity[r.file] ??= []).push(score(r));
for (const [f, s] of Object.entries(byCity)) {
  console.log(`  ${f.replace(".ts", "").padEnd(12)} campuses=${s.length} median-score=${s.sort((a, b) => a - b)[Math.floor(s.length / 2)]}`);
}
