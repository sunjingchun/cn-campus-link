#!/usr/bin/env node
/**
 * Post-deploy smoke. HTTP checks plus a sqlite proof that production
 * has no @demo.nihaocampus.cn users.
 *
 *   node scripts/smoke.mjs
 *   node scripts/smoke.mjs http://localhost:1
 */

import path from "node:path";
import Database from "better-sqlite3";
import fs from "node:fs";

const DEMO_SUFFIX = "@demo.nihaocampus.cn";
const BASE = (process.argv[2] || process.env.NIHAOCAMPUS_SMOKE_URL || "http://127.0.0.1:41729").replace(
  /\/$/,
  "",
);
const DB_PATH = process.env.NIHAOCAMPUS_DB ?? path.join(process.cwd(), ".data", "nihaocampus.db");

function fail(message) {
  console.error(`smoke: ${message}`);
  process.exit(1);
}

async function request(pathname, init = {}) {
  const url = `${BASE}${pathname}`;
  try {
    return await fetch(url, { redirect: "manual", signal: AbortSignal.timeout(8000), ...init });
  } catch (error) {
    fail(`request failed ${url} (${error instanceof Error ? error.message : error})`);
  }
}

function assertStatus(pathname, response, expected) {
  if (response.status !== expected) {
    fail(`GET ${pathname} expected ${expected}, got ${response.status}`);
  }
  console.log(`smoke: GET ${pathname} ${response.status}`);
}

function robotsAllows(text) {
  const lines = text.split(/\r?\n/).map((line) => line.trim());
  const blocked = lines.some((line) => /^disallow:\s*\/\s*$/i.test(line));
  return !blocked;
}

function countDemoUsers(dbPath) {
  if (!fs.existsSync(dbPath)) fail(`no database at ${dbPath}, cannot prove demo users are absent`);
  const db = new Database(dbPath, { readonly: true, fileMustExist: true });
  try {
    const table = db
      .prepare(`SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'users'`)
      .get();
    if (!table) return 0;
    return db
      .prepare(`SELECT COUNT(*) AS n FROM users WHERE lower(email) LIKE ?`)
      .get(`%${DEMO_SUFFIX}`).n;
  } finally {
    db.close();
  }
}

async function main() {
  const home = await request("/");
  assertStatus("/", home, 200);

  const campus = await request("/campus/nuaa-jiangning");
  assertStatus("/campus/nuaa-jiangning", campus, 200);

  const place = await request("/place/jiangsu-ithc");
  assertStatus("/place/jiangsu-ithc", place, 200);

  const event = await request("/api/events", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "page_view", path: "/smoke" }),
  });
  if (event.status !== 204) fail(`POST /api/events expected 204, got ${event.status}`);
  console.log("smoke: POST /api/events 204");

  const robots = await request("/robots.txt");
  assertStatus("/robots.txt", robots, 200);
  const robotsText = await robots.text();
  if (!robotsAllows(robotsText)) fail("robots.txt still disallows /");
  console.log("smoke: robots.txt allows crawl");

  const deleted = await request("/city/shanghai");
  if (deleted.status !== 404) fail(`GET /city/shanghai expected 404, got ${deleted.status}`);
  console.log("smoke: GET /city/shanghai 404");

  const demoCount = countDemoUsers(DB_PATH);
  if (demoCount > 0) fail(`users table has ${demoCount} @demo.nihaocampus.cn addresses`);
  console.log("smoke: no @demo.nihaocampus.cn users");
  console.log("smoke: 6 http checks plus demo-user assert passed");
}

main();
