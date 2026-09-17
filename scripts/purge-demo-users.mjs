#!/usr/bin/env node
/**
 * Remove @demo.nihaocampus.cn users before production launch.
 * smoke.mjs fails if any remain. Run only after operator confirms.
 *
 *   node scripts/purge-demo-users.mjs --dry-run
 *   NIHAOCAMPUS_DB=/var/lib/nihaocampus/nihaocampus.db node scripts/purge-demo-users.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Database from "better-sqlite3";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DEMO_SUFFIX = "@demo.nihaocampus.cn";
const dryRun = process.argv.includes("--dry-run");

function fail(message) {
  console.error(`purge-demo: ${message}`);
  process.exit(1);
}

function main() {
  const dbPath = process.env.NIHAOCAMPUS_DB ?? path.join(ROOT, ".data", "nihaocampus.db");
  if (!fs.existsSync(dbPath)) fail(`no database at ${dbPath}`);

  const db = new Database(dbPath);
  const demoIds = db
    .prepare(`SELECT id, email FROM users WHERE lower(email) LIKE ?`)
    .all(`%${DEMO_SUFFIX}`)
    .map((row) => row.id);

  if (demoIds.length === 0) {
    console.log("purge-demo: no demo users");
    db.close();
    return;
  }

  console.log(`purge-demo: found ${demoIds.length} demo users`);
  if (dryRun) {
    console.log("purge-demo: dry-run ok");
    db.close();
    return;
  }

  const placeholders = demoIds.map(() => "?").join(",");
  db.transaction(() => {
    db.prepare(`DELETE FROM sessions WHERE user_id IN (${placeholders})`).run(...demoIds);
    db.prepare(`DELETE FROM replies WHERE user_id IN (${placeholders})`).run(...demoIds);
    db.prepare(`DELETE FROM posts WHERE user_id IN (${placeholders})`).run(...demoIds);
    db.prepare(`DELETE FROM notes WHERE user_id IN (${placeholders})`).run(...demoIds);
    db.prepare(`DELETE FROM marks WHERE user_id IN (${placeholders})`).run(...demoIds);
    db.prepare(`DELETE FROM users WHERE id IN (${placeholders})`).run(...demoIds);
  })();

  const left = db
    .prepare(`SELECT COUNT(*) AS n FROM users WHERE lower(email) LIKE ?`)
    .get(`%${DEMO_SUFFIX}`).n;
  db.close();
  if (left > 0) fail(`${left} demo users remain`);
  console.log("purge-demo: done");
}

main();
