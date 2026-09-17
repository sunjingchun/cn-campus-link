#!/usr/bin/env node
/**
 * P7 perf probe. Local trunk vs local staging. Does not hit intro.10n1j.top.
 *
 *   BASELINE_BASE=http://127.0.0.1:41780 VERIFY_BASE=http://127.0.0.1:41782 \
 *     node scripts/p7-perf.mjs
 */

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const HEAD = process.env.VERIFY_BASE ?? "http://127.0.0.1:41782";
const BASELINE = process.env.BASELINE_BASE ?? "http://127.0.0.1:41780";
const OUT = process.env.SWARM_DIR ?? "/tmp/swarm-p7";
const RUNS = 10;
const HISTORICAL_PROD_HOME_TOTAL = 1.797;

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

function curlTime(url) {
  const ran = spawnSync(
    "curl",
    ["-s", "-o", "/dev/null", "-w", "%{time_starttransfer} %{time_total} %{size_download}", url],
    { encoding: "utf8" },
  );
  if (ran.status !== 0) throw new Error(ran.stderr || `curl failed ${url}`);
  const [ttfb, total, bytes] = ran.stdout.trim().split(/\s+/).map(Number);
  return { ttfb, total, bytes };
}

function sample(url) {
  const rows = [];
  for (let i = 0; i < RUNS; i += 1) rows.push(curlTime(url));
  return {
    ttfb: median(rows.map((row) => row.ttfb)),
    total: median(rows.map((row) => row.total)),
    bytes: median(rows.map((row) => row.bytes)),
  };
}

function check(name, head, trunk, rule) {
  const ok = rule(head, trunk);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${name}  trunk ttfb=${trunk.ttfb.toFixed(3)}s total=${trunk.total.toFixed(3)}s  head ttfb=${head.ttfb.toFixed(3)}s total=${head.total.toFixed(3)}s`);
  return { name, ok, head, trunk };
}

const homeTrunk = sample(`${BASELINE}/`);
const homeHead = sample(`${HEAD}/`);
const campusTrunk = sample(`${BASELINE}/campus/nju-xianlin`);
const campusHead = sample(`${HEAD}/campus/nuaa-jiangning`);

const results = [
  check("home-ttfb-120pct", homeHead, homeTrunk, (head, trunk) => head.ttfb <= trunk.ttfb * 1.2),
  check("home-total-2.5s", homeHead, homeTrunk, (head) => head.total <= 2.5),
  check("campus-ttfb-120pct", campusHead, campusTrunk, (head, trunk) => head.ttfb <= trunk.ttfb * 1.2),
];

const report = {
  historicalProdHomeTotal: HISTORICAL_PROD_HOME_TOTAL,
  note: "local staging vs local trunk. intro.10n1j.top was not probed.",
  homeTrunk,
  homeHead,
  campusTrunk,
  campusHead,
  results,
};
fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, "perf.json"), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
if (results.some((row) => !row.ok)) process.exit(1);
