// Throwaway probe. Measures how much of a rendered page a non-Chinese reader can read.
// Strips script/style, walks visible text runs, buckets each run by script.
import fs from "node:fs";

const CJK = /[\u4e00-\u9fff\u3400-\u4dbf]/;
const LATIN = /[A-Za-z]{3,}/;

function textRuns(html) {
  const stripped = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ");
  return stripped
    .split(/<[^>]+>/)
    .map((s) =>
      s
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&#x27;|&#39;/g, "'")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .trim(),
    )
    .filter((s) => s.length > 0 && !/^[\s\p{P}\p{S}\d]+$/u.test(s));
}

for (const file of process.argv.slice(2)) {
  const runs = textRuns(fs.readFileSync(file, "utf8"));
  let cjkOnly = 0;
  let mixed = 0;
  let latinOnly = 0;
  let cjkChars = 0;
  let latinChars = 0;
  const samples = [];
  for (const run of runs) {
    const hasCjk = CJK.test(run);
    const hasLatin = LATIN.test(run);
    cjkChars += (run.match(/[\u4e00-\u9fff]/g) ?? []).length;
    latinChars += (run.match(/[A-Za-z]/g) ?? []).length;
    if (hasCjk && !hasLatin) {
      cjkOnly += 1;
      if (run.length > 14 && samples.length < 6) samples.push(run.slice(0, 78));
    } else if (hasCjk) mixed += 1;
    else if (hasLatin) latinOnly += 1;
  }
  const total = cjkOnly + mixed + latinOnly;
  const pct = (n) => `${((n / total) * 100).toFixed(1)}%`;
  console.log(`\n=== ${file} ===`);
  console.log(`text runs=${total}  cjk-only=${cjkOnly} (${pct(cjkOnly)})  mixed=${mixed} (${pct(mixed)})  latin-only=${latinOnly} (${pct(latinOnly)})`);
  console.log(`chars: cjk=${cjkChars} latin=${latinChars}  cjk share=${((cjkChars / (cjkChars + latinChars)) * 100).toFixed(1)}%`);
  console.log("cjk-only runs a non-Chinese reader cannot read:");
  for (const s of samples) console.log(`  - ${s}`);
}
