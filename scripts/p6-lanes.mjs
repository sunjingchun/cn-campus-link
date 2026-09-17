#!/usr/bin/env node
/**
 * P6 live lanes. Drive production Chrome against VERIFY_BASE.
 *
 *   CHROME_PATH=... VERIFY_BASE=http://127.0.0.1:41739 BASELINE_BASE=http://127.0.0.1:41729 \
 *     node scripts/p6-lanes.mjs
 */

import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import puppeteer from "puppeteer-core";

const HEAD = process.env.VERIFY_BASE ?? "http://127.0.0.1:41739";
const BASELINE = process.env.BASELINE_BASE ?? "http://127.0.0.1:41729";
const OUT = process.env.SWARM_DIR ?? "/tmp/swarm-p6";
const DB_PATH = process.env.NIHAOCAMPUS_DB ?? path.join(process.cwd(), ".data", "nihaocampus.db");
const CAMPUS = "/campus/nuaa-jiangning";
const CHROME =
  process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const STEPS = [
  "registration",
  "tempResidence",
  "healthCheck",
  "residencePermit",
  "simCard",
  "bankAccount",
  "mobilePay",
  "campusCard",
  "insurance",
];

const settle = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

function workerDir(n) {
  const dir = path.join(OUT, `worker-${n}`);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

async function launch() {
  return puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
}

async function openPage(browser, url, width = 1440) {
  const context = await browser.createBrowserContext();
  const page = await context.newPage();
  page.context = context;
  await page.setViewport({ width, height: 1000 });
  await page.goto(url, { waitUntil: "networkidle0", timeout: 90_000 });
  await settle(500);
  return page;
}

async function closePage(page) {
  const context = page.context;
  await page.close();
  if (context) await context.close();
}

async function progressText(page) {
  return page.evaluate(() => document.querySelector("[data-progress-ring]")?.textContent?.trim() ?? "");
}

async function markStep(page, stepId, date = "2026-09-08") {
  return page.evaluate(
    (id, onDate) => {
      const root = document.querySelector(`[data-step-mark="${id}"]`);
      if (!root) return "missing";
      const input = root.querySelector('input[type="date"]');
      const button = root.querySelector("[data-mark-save]");
      if (!input || !button) return "controls-missing";
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
      setter.call(input, onDate);
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
      button.click();
      return "clicked";
    },
    stepId,
    date,
  );
}

async function unmarkStep(page, stepId) {
  return page.evaluate((id) => {
    const root = document.querySelector(`[data-step-mark="${id}"]`);
    const button = root?.querySelector("[data-unmark]");
    if (!button) return "missing";
    button.click();
    return "clicked";
  }, stepId);
}

async function waitProgress(page, expected, timeout = 4000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if ((await progressText(page)) === expected) return true;
    await settle(80);
  }
  return false;
}

function sqlite(sql, params = []) {
  const db = new Database(DB_PATH);
  const row = db.prepare(sql).get(...params);
  db.close();
  return row;
}

function report(n, name, ok, detail, shot) {
  const status = ok ? "PASS" : "FAIL";
  console.log(`  ${status}  lane ${n} ${name}${detail ? ` — ${detail}` : ""}${shot ? `  ${shot}` : ""}`);
  return { n, name, status, detail, shot };
}

async function lane1(browser) {
  const dir = workerDir(1);
  const baseline = await openPage(browser, `${BASELINE}/campus/nju-xianlin`);
  const baselineMarks = await baseline.evaluate(() => document.querySelectorAll("[data-step-mark]").length);
  await baseline.screenshot({ path: path.join(dir, "mark-trunk-vs-head-before.png") });
  await closePage(baseline);

  const page = await openPage(browser, `${HEAD}/campus/nju-xianlin`);
  const headMarks = await page.evaluate(() => document.querySelectorAll("[data-step-mark]").length);
  await markStep(page, "registration");
  const reflected = await waitProgress(page, "1 / 9");
  await page.reload({ waitUntil: "networkidle0" });
  await settle(500);
  const after = await progressText(page);
  const shot = path.join(dir, "mark-trunk-vs-head.png");
  await page.screenshot({ path: shot, fullPage: true });
  await closePage(page);
  const ok = baselineMarks === 0 && headMarks === 9 && reflected && after === "1 / 9";
  return report(1, "trunk vs head", ok, `baselineMarks=${baselineMarks} headMarks=${headMarks} after=${after}`, shot);
}

async function lane2(browser) {
  const dir = workerDir(2);
  const page = await openPage(browser, `${HEAD}${CAMPUS}`);
  for (const step of STEPS) {
    await markStep(page, step);
    await settle(120);
  }
  const dialogs = await page.evaluate(() => document.querySelectorAll('[role="dialog"]').length);
  const text = await progressText(page);
  const shot = path.join(dir, "nine-marks-anonymous.png");
  await page.screenshot({ path: shot, fullPage: true });
  await closePage(page);
  return report(2, "nine anonymous marks", text === "9 / 9" && dialogs === 0, `progress=${text} dialogs=${dialogs}`, shot);
}

async function lane3(browser) {
  const dir = workerDir(3);
  const page = await openPage(browser, `${HEAD}${CAMPUS}`);
  const seen = [];
  for (let i = 0; i < 5; i += 1) {
    await markStep(page, "healthCheck");
    await settle(80);
    seen.push(await progressText(page));
  }
  await settle(400);
  const row = sqlite(
    "SELECT COUNT(*) AS n FROM marks WHERE campus_slug = ? AND item_id = ?",
    ["nuaa-jiangning", "healthCheck"],
  );
  const shot = path.join(dir, "mark-idempotent.png");
  await page.screenshot({ path: shot });
  await closePage(page);
  const unique = new Set(seen.filter(Boolean));
  const ok = row?.n >= 1 && unique.size <= 2;
  return report(3, "idempotent mark", ok, `rows=${row?.n} texts=${seen.join("|")}`, shot);
}

async function lane4(browser) {
  const dir = workerDir(4);
  const page = await openPage(browser, `${HEAD}${CAMPUS}`);
  for (const step of ["simCard", "bankAccount", "mobilePay"]) {
    await markStep(page, step);
    await settle(250);
  }
  await settle(300);
  await unmarkStep(page, "mobilePay");
  const ok = await waitProgress(page, "2 / 9");
  const text = await progressText(page);
  const shot = path.join(dir, "unmark-works.png");
  await page.screenshot({ path: shot, fullPage: true });
  await closePage(page);
  return report(4, "unmark one of three", ok, `progress=${text}`, shot);
}

async function lane5(browser) {
  const dir = workerDir(5);
  const page = await openPage(browser, `${HEAD}${CAMPUS}`);
  await page.evaluate(() => document.querySelector("[data-leave-note]")?.click());
  await settle(400);
  const dialog = await page.evaluate(() => {
    const node = document.querySelector('[role="dialog"]');
    return node ? node.innerText : "";
  });
  const shot = path.join(dir, "note-requires-account.png");
  await page.screenshot({ path: shot });
  await closePage(page);
  const ok = /signed|署名|name/i.test(dialog);
  return report(5, "note requires account", ok, dialog.slice(0, 120).replace(/\s+/g, " "), shot);
}

async function lane6(browser) {
  const dir = workerDir(6);
  const page = await openPage(browser, `${HEAD}${CAMPUS}`);
  await page.evaluate(() => {
    const button = [...document.querySelectorAll("button")].find((n) => /^(Join|加入)$/.test((n.textContent ?? "").trim()));
    button?.click();
  });
  await settle(400);
  const info = await page.evaluate(() => {
    const form = document.querySelector("[data-register-form]") ?? document.querySelector('[role="dialog"] form');
    const inputs = [...(form?.querySelectorAll("input") ?? [])];
    return {
      count: inputs.length,
      types: inputs.map((n) => n.type),
      hasPhone: inputs.some((n) => n.type === "tel" || /phone|手机/.test(n.name + n.placeholder + (n.getAttribute("aria-label") ?? ""))),
    };
  });
  const shot = path.join(dir, "register-three-fields.png");
  await page.screenshot({ path: shot });
  await closePage(page);
  const ok = info.count === 3 && !info.hasPhone && info.types.includes("email") && info.types.includes("password");
  return report(6, "register three fields", ok, JSON.stringify(info), shot);
}

async function lane7(browser) {
  const dir = workerDir(7);
  const page = await openPage(browser, `${HEAD}${CAMPUS}`);
  await markStep(page, "campusCard");
  await waitProgress(page, "1 / 9");
  const before = await progressText(page);
  await page.evaluate(() => {
    const button = [...document.querySelectorAll("button")].find((n) => /^(Join|加入)$/.test((n.textContent ?? "").trim()));
    button?.click();
  });
  await settle(400);
  const email = `lane7_${Date.now()}@example.com`;
  await page.evaluate((addr) => {
    const form = document.querySelector("[data-register-form]");
    const inputs = [...form.querySelectorAll("input")];
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
    setter.call(inputs[0], "Lane Seven");
    inputs[0].dispatchEvent(new Event("input", { bubbles: true }));
    setter.call(inputs[1], addr);
    inputs[1].dispatchEvent(new Event("input", { bubbles: true }));
    setter.call(inputs[2], "verify-password");
    inputs[2].dispatchEvent(new Event("input", { bubbles: true }));
    form.requestSubmit();
  }, email);
  await settle(2000);
  const after = await progressText(page);
  const row = sqlite(
    "SELECT user_id FROM marks WHERE campus_slug = ? AND item_id = ? ORDER BY created_at DESC LIMIT 1",
    ["nuaa-jiangning", "campusCard"],
  );
  const shot = path.join(dir, "marks-backfilled.png");
  await page.screenshot({ path: shot });
  await closePage(page);
  const ok = before === "1 / 9" && after === "1 / 9" && Boolean(row?.user_id);
  return report(7, "marks backfilled", ok, `before=${before} after=${after} user_id=${row?.user_id ?? "null"}`, shot);
}

async function lane8(browser) {
  const dir = workerDir(8);
  const page = await openPage(browser, `${HEAD}${CAMPUS}`);
  await page.evaluate(() => {
    const button = [...document.querySelectorAll("button")].find((n) => /^(Sign in|登录)$/.test((n.textContent ?? "").trim()));
    button?.click();
  });
  await settle(400);
  await page.evaluate(() => {
    const inputs = [...document.querySelectorAll('[role="dialog"] input')];
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
    setter.call(inputs[0], "amina_k");
    inputs[0].dispatchEvent(new Event("input", { bubbles: true }));
    setter.call(inputs[1], "nihaocampus");
    inputs[1].dispatchEvent(new Event("input", { bubbles: true }));
    const submit = [...document.querySelectorAll('[role="dialog"] button')].find((n) =>
      /^(Sign in|登录)$/.test((n.textContent ?? "").trim()),
    );
    submit?.click();
  });
  await settle(2500);
  const body = "The CIE window on the first floor closed at 16:30 when I went.";
  await page.evaluate((text) => {
    const box = document.querySelector("[data-note-body]");
    const button = document.querySelector("[data-leave-note]");
    const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value").set;
    setter.call(box, text);
    box.dispatchEvent(new Event("input", { bubbles: true }));
    button.click();
  }, body);
  await settle(1500);
  const first = await page.evaluate(() => document.querySelector("[data-note-author]")?.textContent ?? "");
  await page.reload({ waitUntil: "networkidle0" });
  await settle(800);
  const after = await page.evaluate(() => document.body.innerText.includes("16:30"));
  const shot = path.join(dir, "note-attributed.png");
  await page.screenshot({ path: shot, fullPage: true });
  await closePage(page);
  const ok = /Amina/i.test(first) && after;
  return report(8, "signed note persists", ok, `author=${first.slice(0, 80)} after=${after}`, shot);
}

async function lane9(browser) {
  const dir = workerDir(9);
  const page = await openPage(browser, `${HEAD}/campus/nju-xianlin`);
  const text = await page.evaluate(() => {
    const root = document.querySelector('[data-step-mark="insurance"]');
    return root ? root.innerText : "";
  });
  const shot = path.join(dir, "empty-state-invites.png");
  await page.screenshot({ path: shot });
  await closePage(page);
  const ok = /Mark the day you'll go|标一下你哪天去/.test(text) && !/0 people|0 人/.test(text);
  return report(9, "empty state invites", ok, text.replace(/\s+/g, " ").slice(0, 140), shot);
}

async function lane10(browser) {
  const dir = workerDir(10);
  const page = await openPage(browser, `${HEAD}${CAMPUS}`, 390);
  await markStep(page, "registration");
  await waitProgress(page, "1 / 9");
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  const shot = path.join(dir, "mark-note-mobile-390.png");
  await page.screenshot({ path: shot, fullPage: true });
  await closePage(page);
  return report(10, "mobile 390", overflow <= 1, `overflow=${overflow}`, shot);
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await launch();
  const lanes = [lane1, lane2, lane3, lane4, lane5, lane6, lane7, lane8, lane9, lane10];
  const results = [];
  for (const [index, lane] of lanes.entries()) {
    try {
      results.push(await lane(browser));
    } catch (error) {
      results.push(report(index + 1, "threw", false, String(error).slice(0, 200)));
    }
  }
  await browser.close();
  const failed = results.filter((row) => row.status !== "PASS").length;
  console.log(`\n${results.length - failed} passed, ${failed} failed`);
  fs.writeFileSync(path.join(OUT, "lanes.json"), JSON.stringify(results, null, 2));
  if (failed > 0) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
