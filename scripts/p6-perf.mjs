#!/usr/bin/env node
/**
 * P6 perf probe. Optimistic click-to-ring, POST /api/marks p95, campus TTFB vs baseline.
 *
 *   CHROME_PATH=... VERIFY_BASE=http://127.0.0.1:41739 BASELINE_BASE=http://127.0.0.1:41729 \
 *     node scripts/p6-perf.mjs
 */

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import puppeteer from "puppeteer-core";

const HEAD = process.env.VERIFY_BASE ?? "http://127.0.0.1:41739";
const BASELINE = process.env.BASELINE_BASE ?? "http://127.0.0.1:41729";
const OUT = process.env.SWARM_DIR ?? "/tmp/swarm-p6";
const CHROME =
  process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const CAMPUS = "/campus/nuaa-jiangning";

const settle = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

function percentileIndex(values, n) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[n - 1];
}

async function clickToRingMs(browser) {
  const context = await browser.createBrowserContext();
  const page = await context.newPage();
  await page.setViewport({ width: 1440, height: 1000 });
  await page.goto(`${HEAD}${CAMPUS}`, { waitUntil: "networkidle0", timeout: 90_000 });
  await settle(400);
  const ms = await page.evaluate(async () => {
    const root = document.querySelector('[data-step-mark="registration"]');
    const input = root?.querySelector('input[type="date"]');
    const button = root?.querySelector("[data-mark-save]");
    if (!input || !button) return -1;
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
    setter.call(input, "2026-09-08");
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
    const start = performance.now();
    button.click();
    for (;;) {
      const text = document.querySelector("[data-progress-ring]")?.textContent?.trim() ?? "";
      if (text === "1 / 9") return performance.now() - start;
      if (performance.now() - start > 2000) return -1;
      await new Promise((resolve) => requestAnimationFrame(resolve));
    }
  });
  await page.close();
  await context.close();
  return ms;
}

function curlTime(url, extra) {
  const args = ["-s", "-o", "/dev/null", "-w", "%{time_starttransfer} %{time_total}", ...extra, url];
  const ran = spawnSync("curl", args, { encoding: "utf8" });
  if (ran.status !== 0) throw new Error(ran.stderr || `curl failed ${url}`);
  const [ttfb, total] = ran.stdout.trim().split(/\s+/).map(Number);
  return { ttfb, total };
}

function markPostTimes(count) {
  const jar = path.join(OUT, "marks-cookie.txt");
  fs.mkdirSync(OUT, { recursive: true });
  fs.rmSync(jar, { force: true });
  const times = [];
  for (let i = 0; i < count; i += 1) {
    const body = JSON.stringify({
      campus_slug: "nuaa-jiangning",
      item_kind: "landing_step",
      item_id: "registration",
      kind: "planned",
      on_date: "2026-09-08",
    });
    const ran = spawnSync(
      "curl",
      [
        "-s",
        "-o",
        "/dev/null",
        "-w",
        "%{time_total}",
        "-c",
        jar,
        "-b",
        jar,
        "-H",
        "content-type: application/json",
        "-d",
        body,
        `${HEAD}/api/marks`,
      ],
      { encoding: "utf8" },
    );
    if (ran.status !== 0) throw new Error(ran.stderr || "POST /api/marks failed");
    times.push(Number(ran.stdout.trim()) * 1000);
  }
  return times;
}

function pageTtfb(base, samples) {
  const times = [];
  for (let i = 0; i < samples; i += 1) {
    times.push(curlTime(`${base}${CAMPUS}`, []).ttfb * 1000);
  }
  return times;
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
  const ui = [];
  for (let i = 0; i < 10; i += 1) {
    ui.push(await clickToRingMs(browser));
  }
  await browser.close();

  const posts = markPostTimes(200);
  const headTtfb = pageTtfb(HEAD, 20);
  const trunkTtfb = pageTtfb(BASELINE, 20);

  const uiMedian = median(ui);
  const postP95 = percentileIndex(posts, 190);
  const headMedian = median(headTtfb);
  const trunkMedian = median(trunkTtfb);
  const ttfbRatio = headMedian / trunkMedian;

  const result = {
    uiMs: ui,
    uiMedianMs: uiMedian,
    uiBudgetMs: 100,
    uiPass: ui.every((n) => n >= 0) && uiMedian < 100,
    postMs: posts,
    postP95Ms: postP95,
    postBudgetMs: 80,
    postPass: postP95 < 80,
    headTtfbMs: headTtfb,
    trunkTtfbMs: trunkTtfb,
    headMedianTtfbMs: headMedian,
    trunkMedianTtfbMs: trunkMedian,
    ttfbRatio,
    ttfbPass: ttfbRatio <= 1.1,
  };
  result.pass = result.uiPass && result.postPass && result.ttfbPass;
  fs.writeFileSync(path.join(OUT, "perf.json"), JSON.stringify(result, null, 2));
  console.log(
    JSON.stringify(
      {
        uiMedianMs: Number(uiMedian.toFixed(2)),
        uiPass: result.uiPass,
        postP95Ms: Number(postP95.toFixed(2)),
        postPass: result.postPass,
        headMedianTtfbMs: Number(headMedian.toFixed(2)),
        trunkMedianTtfbMs: Number(trunkMedian.toFixed(2)),
        ttfbRatio: Number(ttfbRatio.toFixed(3)),
        ttfbPass: result.ttfbPass,
        pass: result.pass,
      },
      null,
      2,
    ),
  );
  if (!result.pass) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
