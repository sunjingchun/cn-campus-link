#!/usr/bin/env node
/**
 * Import signed interview notes from a JSON file into NIHAOCAMPUS_DB.
 * For operator use after Appendix E interviews. Does not invent content.
 *
 *   node scripts/import-interview-notes.mjs docs/interviews/notes.json
 *   node scripts/import-interview-notes.mjs --dry-run docs/interviews/notes.json
 *   NIHAOCAMPUS_DB=/var/lib/nihaocampus/nihaocampus.db node scripts/import-interview-notes.mjs notes.json
 */

import { randomBytes, randomUUID, scrypt } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import Database from "better-sqlite3";
import { evaluateNotes } from "./audit-launch.mjs";

const scryptAsync = promisify(scrypt);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CAMPUS = "nuaa-jiangning";
const DEMO_SUFFIX = "@demo.nihaocampus.cn";
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

function loadSchema() {
  const dbTs = fs.readFileSync(path.join(ROOT, "src/lib/db.ts"), "utf8");
  const match = dbTs.match(/const SCHEMA = `([\s\S]*?)`;/);
  if (!match) throw new Error("could not read SCHEMA from src/lib/db.ts");
  return match[1];
}

async function hashPassword(password) {
  const salt = randomBytes(16);
  const derived = await scryptAsync(password, salt, 64);
  return `${salt.toString("hex")}:${derived.toString("hex")}`;
}

function newId(prefix) {
  return `${prefix}_${randomUUID().replace(/-/g, "").slice(0, 16)}`;
}

function fail(message) {
  console.error(`import-notes: ${message}`);
  process.exit(1);
}

function allocateUsername(db, email) {
  const local = email.split("@")[0] ?? "";
  let base = local
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
  if (base.length < 3) base = `u_${newId("usr").replace(/^usr_/, "").slice(0, 8)}`;
  if (base.length > 20) base = base.slice(0, 20);
  let candidate = base;
  let n = 1;
  const taken = db.prepare(`SELECT 1 FROM users WHERE username = ? LIMIT 1`);
  while (taken.get(candidate)) {
    const suffix = String(n);
    candidate = `${base.slice(0, Math.max(1, 20 - suffix.length))}${suffix}`;
    n += 1;
  }
  return candidate;
}

function validatePayload(data) {
  if (!data || typeof data !== "object") fail("JSON root must be an object");
  if (!Array.isArray(data.contributors) || data.contributors.length === 0) {
    fail("contributors[] is required and must not be empty");
  }
  if (!Array.isArray(data.notes) || data.notes.length === 0) {
    fail("notes[] is required and must not be empty");
  }

  const contributors = new Map();
  for (const row of data.contributors) {
    const email = String(row.email ?? "").trim().toLowerCase();
    if (!email || !email.includes("@")) fail(`contributor email invalid: ${row.email}`);
    if (email.endsWith(DEMO_SUFFIX)) fail(`refuse demo email: ${email}`);
    const password = String(row.password ?? "");
    if (password.length < 8) fail(`password for ${email} must be at least 8 characters`);
    const displayName = String(row.display_name ?? row.displayName ?? "").trim();
    if (!displayName) fail(`display_name required for ${email}`);
    const campusSlug = String(row.campus_slug ?? CAMPUS);
    if (campusSlug !== CAMPUS) fail(`only ${CAMPUS} is supported in MVP: ${campusSlug}`);
    contributors.set(email, {
      email,
      password,
      displayName,
      country: String(row.country ?? "").trim(),
      arrivalYear: row.arrival_year ?? row.arrivalYear ?? null,
      campusSlug,
    });
  }

  const notes = [];
  for (const row of data.notes) {
    const contributorEmail = String(row.contributor_email ?? row.contributorEmail ?? "").trim().toLowerCase();
    if (!contributors.has(contributorEmail)) {
      fail(`note references unknown contributor_email: ${contributorEmail}`);
    }
    const campusSlug = String(row.campus_slug ?? CAMPUS);
    if (campusSlug !== CAMPUS) fail(`only ${CAMPUS} notes are supported: ${campusSlug}`);
    const itemId = String(row.item_id ?? row.itemId ?? "");
    if (!LANDING_STEPS.includes(itemId)) {
      fail(`item_id must be one of ${LANDING_STEPS.join(", ")}: ${itemId}`);
    }
    let body = String(row.body ?? "").trim();
    if (!body) fail(`note body required for ${contributorEmail} / ${itemId}`);
    const sourceUrl = String(row.source_url ?? row.sourceUrl ?? "").trim();
    const providedOn = String(row.provided_on ?? row.providedOn ?? "").trim();
    if (sourceUrl) {
      body = `${body}\n\nSource: ${sourceUrl}`;
    }
    if (providedOn) {
      body = `${body}\n\nProvided: ${providedOn}`;
    }
    if (body.length > 2000) fail(`note body exceeds 2000 chars after citations: ${itemId}`);
    notes.push({ contributorEmail, campusSlug, itemId, body });
  }

  const stepIds = new Set(notes.map((n) => n.itemId));
  return { contributors, notes, stepCount: stepIds.size, noteCount: notes.length };
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const file = args.find((arg) => !arg.startsWith("-"));
  if (!file) fail("usage: node scripts/import-interview-notes.mjs [--dry-run] <notes.json>");

  const dbPath = process.env.NIHAOCAMPUS_DB ?? path.join(ROOT, ".data", "nihaocampus.db");
  const payload = JSON.parse(fs.readFileSync(path.resolve(file), "utf8"));
  const { contributors, notes, stepCount, noteCount } = validatePayload(payload);

  console.log(
    `import-notes: ${noteCount} notes from ${contributors.size} contributors across ${stepCount} steps`,
  );
  if (dryRun) {
    console.log("import-notes: dry-run ok");
    return;
  }

  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  const db = new Database(dbPath);
  db.exec(loadSchema());

  const emailLookup = db.prepare(`SELECT id, email FROM users WHERE lower(email) = ? LIMIT 1`);
  const insertUser = db.prepare(
    `INSERT INTO users (id, username, email, password_hash, display_name, country,
       campus_slug, status, arrival_year, avatar_hue, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'exploring', ?, ?, ?)`,
  );
  const insertNote = db.prepare(
    `INSERT INTO notes (id, user_id, campus_slug, item_kind, item_id, body, created_at)
     VALUES (?, ?, ?, 'landing_step', ?, ?, ?)`,
  );

  const userIds = new Map();
  const now = Date.now();
  for (const contributor of contributors.values()) {
    const existing = emailLookup.get(contributor.email);
    if (existing) {
      userIds.set(contributor.email, existing.id);
      console.log(`import-notes: reuse user ${contributor.email}`);
      continue;
    }
    const id = newId("usr");
    const username = allocateUsername(db, contributor.email);
    const passwordHash = await hashPassword(contributor.password);
    insertUser.run(
      id,
      username,
      contributor.email,
      passwordHash,
      contributor.displayName,
      contributor.country,
      contributor.campusSlug,
      contributor.arrivalYear,
      Math.floor(Math.random() * 360),
      now,
    );
    userIds.set(contributor.email, id);
    console.log(`import-notes: created user ${contributor.email} as ${username}`);
  }

  let inserted = 0;
  for (const note of notes) {
    const userId = userIds.get(note.contributorEmail);
    insertNote.run(newId("nte"), userId, note.campusSlug, note.itemId, note.body, now + inserted);
    inserted += 1;
  }
  db.close();

  const gate = evaluateNotes(dbPath);
  console.log(gate.message);
  if (!gate.ok) process.exit(1);
  console.log(`import-notes: wrote ${inserted} notes to ${dbPath}`);
}

main().catch((error) => {
  fail(error instanceof Error ? error.message : String(error));
});
