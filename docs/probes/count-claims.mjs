// Counts the authoritative factual claims the site renders with no source attached.
// A claim is an address, an opening-hours string, or a money amount. Run from the repo root.
import fs from "node:fs";
import path from "node:path";

const dir = "src/data/cities";
const PATTERNS = {
  address: /address: "/g,
  hours: /hours: "/g,
  feeCny: /feeCny: (?!null)\d/g,
  priceCny: /priceCny: (?!null)\d/g,
  phone: /\d{3,4}-\d{7,8}/g,
  sourced: /source: \{/g,
};

let totals = {};
for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".ts"))) {
  const source = fs.readFileSync(path.join(dir, file), "utf8");
  const row = {};
  for (const [name, re] of Object.entries(PATTERNS)) {
    row[name] = (source.match(re) ?? []).length;
    totals[name] = (totals[name] ?? 0) + row[name];
  }
  console.log(
    file.replace(".ts", "").padEnd(10),
    Object.entries(row)
      .map(([k, v]) => `${k}=${String(v).padStart(3)}`)
      .join("  "),
  );
}
console.log("-".repeat(78));
console.log(
  "TOTAL".padEnd(10),
  Object.entries(totals)
    .map(([k, v]) => `${k}=${String(v).padStart(3)}`)
    .join("  "),
);
const claims = totals.address + totals.hours + totals.feeCny + totals.priceCny + totals.phone;
console.log(`\n${claims} 条可被当作权威信息执行的断言，其中 ${totals.sourced} 条带来源。`);
