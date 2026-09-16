const base = process.argv[2];
if (!base) {
  console.error("usage: node docs/probes/verify-facts.mjs http://localhost:41729");
  process.exit(2);
}

const target = new URL("/campus/nju-xianlin", base);
const response = await fetch(target);
if (!response.ok) {
  console.error(`${target} responded ${response.status}`);
  process.exit(2);
}
const html = await response.text();

/** One step's card, so a fee assertion cannot be satisfied or broken by another step's fee. */
function stepCard(id) {
  const start = html.indexOf(`id="landing-${id}"`);
  if (start === -1) return "";
  const next = html.indexOf('id="landing-', start + 1);
  return html.slice(start, next === -1 ? html.length : next);
}

const checks = [
  ["absent", "乐山路"],
  ["present", "创智路 39 号"],
  ["absent", "周一至周六 9:00-17:00"],
  ["present", "9:00-17:30"],
  ["present", "预约", "healthCheck"],
  ["absent", "¥400", "healthCheck"],
  ["present", "¥538", "healthCheck"],
];

console.log(`${target}`);
let failed = 0;
for (const [mode, needle, step] of checks) {
  const haystack = step ? stepCard(step) : html;
  if (step && haystack === "") {
    failed += 1;
    console.log(`FAIL  找不到步骤卡片  landing-${step}`);
    continue;
  }
  const ok = haystack.includes(needle) === (mode === "present");
  if (!ok) failed += 1;
  const where = step ? `第 ${step} 步` : "页面";
  console.log(`${ok ? "PASS" : "FAIL"}  ${where}${mode === "present" ? "含有" : "不含"}  ${needle}`);
}
console.log(`${checks.length - failed}/${checks.length} passed`);
process.exit(failed > 0 ? 1 : 0);
