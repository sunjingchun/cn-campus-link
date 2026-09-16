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

const checks = [
  ["absent", "乐山路"],
  ["present", "创智路 39 号"],
  ["absent", "周一至周六 9:00-17:00"],
  ["present", "9:00-17:30"],
  ["present", "预约"],
  ["absent", "¥400"],
  ["present", "¥538"],
];

console.log(`${target}`);
let failed = 0;
for (const [mode, needle] of checks) {
  const ok = html.includes(needle) === (mode === "present");
  if (!ok) failed += 1;
  console.log(`${ok ? "PASS" : "FAIL"}  ${mode === "present" ? "页面含有" : "页面不含"}  ${needle}`);
}
console.log(`${checks.length - failed}/${checks.length} passed`);
process.exit(failed > 0 ? 1 : 0);
