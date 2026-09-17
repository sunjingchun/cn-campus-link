#!/usr/bin/env node
/**
 * Launch gate. Fails closed unless NUAA Jiangning sources are complete
 * and the notes table has at least 15 signed notes covering 6 landing steps.
 *
 *   node scripts/audit-launch.mjs
 *   node scripts/audit-launch.mjs --self-test
 *
 * --self-test drives constructed sqlite files and a mock sources command.
 * It does not write notes into the app database.
 */

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import Database from "better-sqlite3";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CAMPUS = "nuaa-jiangning";
const MIN_NOTES = 15;
const MIN_STEPS = 6;
const LANDING_STEPS = [
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

const defaultDbPath = () =>
  process.env.NIHAOCAMPUS_DB ?? path.join(process.cwd(), ".data", "nihaocampus.db");

export function createNotesFixture(dbPath, { noteCount, stepCount }) {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
  const db = new Database(dbPath);
  db.exec(`
    CREATE TABLE notes (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      campus_slug TEXT NOT NULL,
      item_kind TEXT NOT NULL,
      item_id TEXT NOT NULL,
      body TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );
  `);
  const steps = LANDING_STEPS.slice(0, stepCount);
  if (steps.length === 0) {
    db.close();
    return dbPath;
  }
  const insert = db.prepare(
    `INSERT INTO notes (id, user_id, campus_slug, item_kind, item_id, body, created_at)
     VALUES (?, ?, ?, 'landing_step', ?, ?, ?)`,
  );
  const now = Date.now();
  for (let i = 0; i < noteCount; i += 1) {
    insert.run(
      `note_fix_${i}`,
      `user_fix_${i % 3}`,
      CAMPUS,
      steps[i % steps.length],
      `fixture note ${i}`,
      now + i,
    );
  }
  db.close();
  return dbPath;
}

export function evaluateNotes(dbPath) {
  if (!fs.existsSync(dbPath)) {
    return {
      ok: false,
      noteCount: 0,
      stepIds: [],
      missingSteps: [...LANDING_STEPS],
      message: `no database at ${dbPath}`,
    };
  }

  const db = new Database(dbPath, { readonly: true, fileMustExist: true });
  try {
    const table = db
      .prepare(`SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'notes'`)
      .get();
    if (!table) {
      return {
        ok: false,
        noteCount: 0,
        stepIds: [],
        missingSteps: [...LANDING_STEPS],
        message: "notes table missing",
      };
    }

    const noteCount = db
      .prepare(`SELECT COUNT(*) AS n FROM notes WHERE campus_slug = ?`)
      .get(CAMPUS).n;
    const stepIds = db
      .prepare(
        `SELECT DISTINCT item_id AS id FROM notes WHERE campus_slug = ? AND item_kind = 'landing_step'`,
      )
      .all(CAMPUS)
      .map((row) => row.id);
    const covered = new Set(stepIds);
    const missingSteps = LANDING_STEPS.filter((step) => !covered.has(step));
    const stepCount = covered.size;
    const parts = [];
    if (noteCount < MIN_NOTES) {
      parts.push(`署名经验 ${noteCount}/${MIN_NOTES}，还差 ${MIN_NOTES - noteCount} 条`);
    }
    if (stepCount < MIN_STEPS) {
      parts.push(`覆盖 ${stepCount}/${MIN_STEPS} 步，缺 ${missingSteps.join(", ")}`);
    }
    const ok = noteCount >= MIN_NOTES && stepCount >= MIN_STEPS;
    return {
      ok,
      noteCount,
      stepIds,
      missingSteps,
      message: ok
        ? `署名经验 ${noteCount}/${MIN_NOTES}，覆盖 ${stepCount} 步`
        : parts.join("；"),
    };
  } finally {
    db.close();
  }
}

export function evaluateSources(command, args, cwd = ROOT) {
  const ran = spawnSync(command, args, { cwd, encoding: "utf8", env: process.env });
  const output = `${ran.stdout ?? ""}${ran.stderr ?? ""}`.trim();
  return {
    ok: ran.status === 0,
    status: ran.status,
    output,
    message:
      ran.status === 0
        ? "audit:sources --require-campus nuaa-jiangning passed"
        : `audit:sources failed (exit ${ran.status})${output ? `\n${output}` : ""}`,
  };
}

function defaultSources() {
  return evaluateSources("npm", ["run", "audit:sources", "--", "--require-campus", CAMPUS]);
}

function printGate(sources, notes) {
  console.log(sources.message);
  console.log(notes.message);
}

async function runSelfTest() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "audit-launch-"));
  const cases = [];

  const passDb = path.join(dir, "pass.db");
  createNotesFixture(passDb, { noteCount: 15, stepCount: 6 });
  const passNotes = evaluateNotes(passDb);
  cases.push({ name: "notes-15-6", ok: passNotes.ok === true });

  const shortDb = path.join(dir, "fourteen.db");
  createNotesFixture(shortDb, { noteCount: 14, stepCount: 6 });
  const shortNotes = evaluateNotes(shortDb);
  cases.push({
    name: "notes-14",
    ok: shortNotes.ok === false && /还差 1 条/.test(shortNotes.message),
  });

  const thinDb = path.join(dir, "five-steps.db");
  createNotesFixture(thinDb, { noteCount: 15, stepCount: 5 });
  const thinNotes = evaluateNotes(thinDb);
  cases.push({
    name: "notes-15-5-steps",
    ok: thinNotes.ok === false && /缺 /.test(thinNotes.message),
  });

  const mockFail = evaluateSources(process.execPath, ["-e", "process.exit(2)"]);
  cases.push({ name: "sources-mock-fail", ok: mockFail.ok === false });

  const mockPass = evaluateSources(process.execPath, ["-e", "process.exit(0)"]);
  cases.push({ name: "sources-mock-pass", ok: mockPass.ok === true });

  const realSources = defaultSources();
  cases.push({ name: "sources-real-nuaa-jiangning", ok: realSources.ok === true });

  let failed = 0;
  for (const item of cases) {
    const status = item.ok ? "PASS" : "FAIL";
    if (!item.ok) failed += 1;
    console.log(`self-test ${item.name}: ${status}`);
  }
  fs.rmSync(dir, { recursive: true, force: true });
  if (failed > 0) {
    console.error(`self-test failed ${failed}/${cases.length}`);
    return 1;
  }
  console.log("self-test ok");
  return 0;
}

async function main() {
  if (process.argv.includes("--self-test")) {
    process.exit(await runSelfTest());
  }

  const sources = defaultSources();
  const notes = evaluateNotes(defaultDbPath());
  printGate(sources, notes);
  if (!sources.ok || !notes.ok) process.exit(1);
}

const isMain =
  process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;
if (isMain) {
  main();
}
