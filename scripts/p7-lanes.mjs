#!/usr/bin/env node
/**
 * P7 live lanes against a local staging deploy. Does not SSH and does not
 * write intro.10n1j.top.
 *
 *   CHROME_PATH=... node scripts/p7-lanes.mjs
 */

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Database from "better-sqlite3";
import puppeteer from "puppeteer-core";
import { createNotesFixture, evaluateNotes } from "./audit-launch.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = process.env.SWARM_DIR ?? "/tmp/swarm-p7";
const CHROME =
  process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const STAGING_ROOT = process.env.NIHAOCAMPUS_DEPLOY_ROOT ?? "/tmp/nihaocampus-staging";
const STAGING_DB = process.env.NIHAOCAMPUS_DB ?? path.join(STAGING_ROOT, "lib", "nihaocampus.db");
const STAGING_PORT = process.env.NIHAOCAMPUS_PORT ?? "41782";
const STAGING_URL = process.env.NIHAOCAMPUS_SMOKE_URL ?? `http://127.0.0.1:${STAGING_PORT}`;
const TRUNK_URL = process.env.BASELINE_BASE ?? "http://127.0.0.1:41780";
const HEAD_URL = process.env.VERIFY_BASE ?? STAGING_URL;
const ADMIN_TOKEN = process.env.NIHAOCAMPUS_ADMIN_TOKEN ?? "p7-lane-token";
const THIRD_PARTY =
  /google-analytics|googletagmanager|doubleclick|hm\.baidu|cnzz|sentry\.io|segment\.com|mixpanel|hotjar|clarity\.ms/i;

const settle = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

function workerDir(n) {
  const dir = path.join(OUT, `worker-${n}`);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function report(n, name, ok, detail, shot) {
  const status = ok ? "PASS" : "FAIL";
  console.log(`  ${status}  lane ${n} ${name}${detail ? ` - ${detail}` : ""}${shot ? `  ${shot}` : ""}`);
  return { n, name, status, detail, shot };
}

function writeLogShot(dir, slug, text) {
  const body = String(text ?? "");
  const dest = path.join(dir, `${slug}.png.html`);
  fs.writeFileSync(dest, `<!doctype html><pre>${escapeHtml(body)}</pre>`);
  fs.writeFileSync(path.join(dir, `${slug}.txt`), body);
  return path.join(dir, `${slug}.txt`);
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[ch]);
}

function curl(url) {
  const ran = spawnSync("curl", ["-sS", "-o", "-", "-w", "\n__STATUS__%{http_code}", url], {
    encoding: "utf8",
  });
  const parts = (ran.stdout || "").split("\n__STATUS__");
  const status = Number(parts.pop());
  return { status, body: parts.join("\n"), err: ran.stderr };
}

function sqlite(sql, params = []) {
  const db = new Database(STAGING_DB);
  const row = db.prepare(sql).get(...params);
  db.close();
  return row;
}

function deployEnv(extra = {}) {
  return {
    ...process.env,
    NIHAOCAMPUS_ALLOW_NONLINUX_BUILD: "1",
    NIHAOCAMPUS_PROCESS: "pidfile",
    NIHAOCAMPUS_DEPLOY_ROOT: STAGING_ROOT,
    NIHAOCAMPUS_DB: STAGING_DB,
    NIHAOCAMPUS_PORT: String(STAGING_PORT),
    NIHAOCAMPUS_SMOKE_URL: STAGING_URL,
    NIHAOCAMPUS_HOSTNAME: "127.0.0.1",
    NIHAOCAMPUS_ADMIN_TOKEN: ADMIN_TOKEN,
    ...extra,
  };
}

function runDeploy(extraEnv = {}) {
  const ran = spawnSync("bash", ["scripts/deploy.sh"], {
    cwd: ROOT,
    encoding: "utf8",
    env: deployEnv(extraEnv),
  });
  return {
    status: ran.status,
    output: `${ran.stdout ?? ""}${ran.stderr ?? ""}`,
  };
}

function seedStagingDb({ notes = 15, steps = 6, users = 1, extraEmails = [] } = {}) {
  fs.mkdirSync(path.dirname(STAGING_DB), { recursive: true });
  createNotesFixture(STAGING_DB, { noteCount: notes, stepCount: steps });
  const db = new Database(STAGING_DB);
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      display_name TEXT NOT NULL,
      country TEXT NOT NULL DEFAULT '',
      campus_slug TEXT,
      status TEXT NOT NULL DEFAULT 'exploring',
      arrival_year INTEGER,
      program TEXT NOT NULL DEFAULT '',
      level TEXT,
      languages TEXT NOT NULL DEFAULT '[]',
      interests TEXT NOT NULL DEFAULT '[]',
      bio TEXT NOT NULL DEFAULT '',
      link_wechat TEXT,
      link_instagram TEXT,
      link_email TEXT,
      avatar_hue INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      anon_id TEXT NOT NULL,
      path TEXT,
      campus_slug TEXT,
      locale TEXT,
      props TEXT,
      referrer TEXT,
      utm TEXT,
      created_at INTEGER NOT NULL
    );
  `);
  const insertUser = db.prepare(
    `INSERT OR REPLACE INTO users (id, username, email, password_hash, display_name, created_at)
     VALUES (?, ?, ?, 'x', ?, ?)`,
  );
  for (let i = 0; i < users; i += 1) {
    insertUser.run(`user_real_${i}`, `real_${i}`, `real_${i}@example.com`, `Real ${i}`, Date.now());
  }
  for (const email of extraEmails) {
    insertUser.run(`user_demo_${email}`, email.split("@")[0], email, "Demo", Date.now());
  }
  db.close();
}

function currentRelease() {
  const current = path.join(STAGING_ROOT, "current");
  try {
    return fs.readlinkSync(current);
  } catch {
    return "";
  }
}

async function launch() {
  if (!fs.existsSync(CHROME)) throw new Error(`CHROME_PATH missing: ${CHROME}`);
  return puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
}

async function shotPage(browser, url, dest, width = 1440) {
  const context = await browser.createBrowserContext();
  const page = await context.newPage();
  await page.setViewport({ width, height: 1000 });
  await page.goto(url, { waitUntil: "networkidle0", timeout: 90_000 });
  await settle(400);
  await page.screenshot({ path: dest, fullPage: true });
  const title = await page.title();
  const html = await page.content();
  await page.close();
  await context.close();
  return { title, html };
}

async function htmlShot(browser, dest, bodyHtml) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1100, height: 900 });
  await page.setContent(`<!doctype html><html><body style="font:14px ui-monospace,monospace;white-space:pre-wrap;padding:16px">${escapeHtml(bodyHtml)}</body></html>`, {
    waitUntil: "load",
  });
  await page.screenshot({ path: dest, fullPage: true });
  await page.close();
  return dest;
}

async function lane1(browser) {
  const dir = workerDir(1);
  const trunkRobots = curl(`${TRUNK_URL}/robots.txt`);
  const headRobots = curl(`${HEAD_URL}/robots.txt`);
  const trunkHome = await shotPage(browser, TRUNK_URL, path.join(dir, "trunk-home.png")).catch((error) => ({
    title: "",
    html: "",
    error: String(error),
  }));
  const headHome = await shotPage(browser, HEAD_URL, path.join(dir, "head-home.png"));
  const dest = path.join(dir, "robots-trunk-vs-head.png");
  await htmlShot(
    browser,
    dest,
    [
      `trunk robots ${trunkRobots.status}`,
      trunkRobots.body.slice(0, 400),
      `trunk title: ${trunkHome.title}`,
      `head robots ${headRobots.status}`,
      headRobots.body.slice(0, 400),
      `head title: ${headHome.title}`,
    ].join("\n\n"),
  );
  const trunkBlocked = /disallow:\s*\/\s*$/im.test(trunkRobots.body);
  const headOpen = !/disallow:\s*\/\s*$/im.test(headRobots.body);
  const titleClean = !/测试版|\[Test\]/i.test(headHome.title);
  const ok = trunkBlocked && headOpen && titleClean;
  return report(
    1,
    "robots-trunk-vs-head",
    ok,
    `trunk disallow=${trunkBlocked} head allow=${headOpen} title=${JSON.stringify(headHome.title)}`,
    dest,
  );
}

async function lane2(browser) {
  const dir = workerDir(2);
  seedStagingDb({ notes: 15, steps: 6, users: 2 });
  const ran = runDeploy();
  const dest = path.join(dir, "deploy-five-steps.png");
  await htmlShot(browser, dest, ran.output.slice(-4000));
  writeLogShot(dir, "deploy-five-steps", ran.output);
  const hasSteps = [1, 2, 3, 4, 5].every((n) => ran.output.includes(`step ${n}/5`));
  const ok = ran.status === 0 && hasSteps && /smoke six checks passed/.test(ran.output);
  return report(2, "deploy-five-steps", ok, `exit ${ran.status}`, dest);
}

async function lane3(browser) {
  const dir = workerDir(3);
  const before = currentRelease();
  const ran = runDeploy({
    NIHAOCAMPUS_SKIP_BUILD: "1",
    NIHAOCAMPUS_SMOKE_URL: "http://127.0.0.1:1",
  });
  const after = currentRelease();
  const live = curl(`${STAGING_URL}/`);
  const dest = path.join(dir, "deploy-rollback.png");
  await htmlShot(
    browser,
    dest,
    `before=${before}\nafter=${after}\nlive=${live.status}\n${ran.output.slice(-3000)}`,
  );
  writeLogShot(dir, "deploy-rollback", ran.output);
  const ok = ran.status !== 0 && after === before && live.status === 200;
  return report(3, "deploy-rollback", ok, `before==after ${after === before} live ${live.status}`, dest);
}

async function lane4(browser) {
  const dir = workerDir(4);
  const before = sqlite("select count(*) as n from users");
  const notesBefore = sqlite("select count(*) as n from notes");
  const first = runDeploy({ NIHAOCAMPUS_SKIP_BUILD: "1" });
  const second = runDeploy({ NIHAOCAMPUS_SKIP_BUILD: "1" });
  const after = sqlite("select count(*) as n from users");
  const notesAfter = sqlite("select count(*) as n from notes");
  const dest = path.join(dir, "db-survives-deploy.png");
  await htmlShot(
    browser,
    dest,
    `users ${before.n} -> ${after.n}\nnotes ${notesBefore.n} -> ${notesAfter.n}\nfirst ${first.status}\nsecond ${second.status}`,
  );
  const ok =
    first.status === 0 &&
    second.status === 0 &&
    before.n === after.n &&
    notesBefore.n === notesAfter.n;
  return report(4, "db-survives-deploy", ok, `users ${before.n}->${after.n} notes ${notesBefore.n}->${notesAfter.n}`, dest);
}

async function lane5(browser) {
  const dir = workerDir(5);
  const fourteen = path.join(dir, "fourteen.db");
  createNotesFixture(fourteen, { noteCount: 14, stepCount: 6 });
  const notes = evaluateNotes(fourteen);
  const ran = spawnSync("bash", ["scripts/deploy.sh"], {
    cwd: ROOT,
    encoding: "utf8",
    env: deployEnv({
      NIHAOCAMPUS_DB: fourteen,
      NIHAOCAMPUS_SKIP_BUILD: "1",
    }),
  });
  const output = `${ran.stdout ?? ""}${ran.stderr ?? ""}`;
  const dest = path.join(dir, "launch-gate-blocks.png");
  await htmlShot(browser, dest, `${notes.message}\n\n${output.slice(-2500)}`);
  writeLogShot(dir, "launch-gate-blocks", output);
  const blocked = ran.status !== 0 && /还差 1 条/.test(output) && !/step 2\/5/.test(output);
  return report(5, "launch-gate-blocks", blocked, notes.message, dest);
}

async function lane6(browser) {
  const dir = workerDir(6);
  const dest = path.join(dir, "utm-through-prod.png");
  const context = await browser.createBrowserContext();
  const page = await context.newPage();
  await page.goto(`${STAGING_URL}/?utm_source=lane6`, { waitUntil: "networkidle0", timeout: 90_000 });
  await settle(1500);
  await page.screenshot({ path: dest, fullPage: true });
  await page.close();
  await context.close();
  const row = sqlite("select count(*) as n from events where utm = ?", ["lane6"]);
  return report(6, "utm-through-prod", row.n > 0, `utm lane6 rows=${row.n}`, dest);
}

async function lane7(browser) {
  const dir = workerDir(7);
  const dest = path.join(dir, "prod-metrics-reachable.png");
  const pageShot = await shotPage(browser, `${STAGING_URL}/admin/metrics?token=${ADMIN_TOKEN}`, dest);
  const titles = ["按天的事件", "来源与 utm", "主漏斗", "他真的要去", "打标分布"];
  const ok = titles.every((title) => pageShot.html.includes(title)) && !pageShot.html.includes("This page could not be found");
  return report(7, "prod-metrics-reachable", ok, "four blocks plus mark distribution", dest);
}

async function lane8(browser) {
  const dir = workerDir(8);
  const dest = path.join(dir, "prod-metrics-404.png");
  const res = curl(`${STAGING_URL}/admin/metrics`);
  await shotPage(browser, `${STAGING_URL}/admin/metrics`, dest).catch(() => null);
  const ok = res.status === 404;
  return report(8, "prod-metrics-404", ok, `status ${res.status}`, dest);
}

async function lane9(browser) {
  const dir = workerDir(9);
  const dest = path.join(dir, "prod-english-mobile.png");
  const context = await browser.createBrowserContext();
  const page = await context.newPage();
  await page.setViewport({ width: 390, height: 844 });
  await page.setCookie({ name: "nihaocampus_locale", value: "en", url: STAGING_URL });
  const pages = ["/", "/campus/nuaa-jiangning", "/place/jiangsu-ithc"];
  const widths = [];
  for (const pathname of pages) {
    await page.goto(`${STAGING_URL}${pathname}`, { waitUntil: "networkidle0", timeout: 90_000 });
    await settle(400);
    const width = await page.evaluate(() => document.scrollingElement?.scrollWidth ?? 0);
    widths.push(width);
  }
  await page.goto(`${STAGING_URL}/campus/nuaa-jiangning`, { waitUntil: "networkidle0", timeout: 90_000 });
  await settle(400);
  const mark = await page.evaluate(() => Boolean(document.querySelector("[data-step-mark], [data-progress-ring]")));
  await page.screenshot({ path: dest, fullPage: true });
  await page.close();
  await context.close();
  const ok = widths.every((width) => width <= 390) && mark;
  return report(9, "prod-english-mobile", ok, `scrollWidth=${widths.join(",")} mark=${mark}`, dest);
}

async function lane10(browser) {
  const dir = workerDir(10);
  const dest = path.join(dir, "prod-from-outside-cn.png");
  const home = await shotPage(browser, STAGING_URL, dest);
  const third = [...home.html.matchAll(/https?:\/\/[^"'\s]+/g)].map((m) => m[0]).filter((url) => THIRD_PARTY.test(url));
  const ok = home.html.length > 0 && third.length === 0;
  return report(10, "prod-from-outside-cn", ok, third.length ? third.slice(0, 5).join(",") : "first-party assets", dest);
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  if (!fs.existsSync(path.join(ROOT, ".next/standalone/server.js"))) {
    console.error("p7-lanes: build standalone first (npm run build)");
    process.exit(1);
  }
  const browser = await launch();
  const results = [];
  try {
    results.push(await lane5(browser));
    results.push(await lane2(browser));
    results.push(await lane3(browser));
    results.push(await lane4(browser));
    results.push(await lane1(browser));
    results.push(await lane6(browser));
    results.push(await lane7(browser));
    results.push(await lane8(browser));
    results.push(await lane9(browser));
    results.push(await lane10(browser));
  } finally {
    await browser.close();
  }
  results.sort((a, b) => a.n - b.n);
  fs.writeFileSync(path.join(OUT, "lanes.json"), JSON.stringify(results, null, 2));
  const failed = results.filter((row) => row.status !== "PASS");
  console.log(`lanes ${results.length - failed.length}/${results.length} passed`);
  process.exit(failed.length ? 1 : 0);
}

await main();
