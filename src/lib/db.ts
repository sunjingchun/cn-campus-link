import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

/**
 * A single SQLite file holds member-created rows and first-party events.
 * City and campus content is static and lives in `src/data`, so nothing here
 * needs a migration when the content changes.
 */

const DB_PATH = process.env.NIHAOCAMPUS_DB ?? path.join(process.cwd(), ".data", "nihaocampus.db");

const SCHEMA = `
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id             TEXT PRIMARY KEY,
  username       TEXT NOT NULL UNIQUE,
  email          TEXT NOT NULL UNIQUE,
  password_hash  TEXT NOT NULL,
  display_name   TEXT NOT NULL,
  country        TEXT NOT NULL DEFAULT '',
  campus_slug    TEXT,
  status         TEXT NOT NULL DEFAULT 'exploring',
  arrival_year   INTEGER,
  program        TEXT NOT NULL DEFAULT '',
  level          TEXT,
  languages      TEXT NOT NULL DEFAULT '[]',
  interests      TEXT NOT NULL DEFAULT '[]',
  bio            TEXT NOT NULL DEFAULT '',
  link_wechat    TEXT,
  link_instagram TEXT,
  link_email     TEXT,
  avatar_hue     INTEGER NOT NULL DEFAULT 0,
  created_at     INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  token      TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS posts (
  id         TEXT PRIMARY KEY,
  room_id    TEXT NOT NULL,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category   TEXT NOT NULL,
  title      TEXT NOT NULL,
  body       TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS replies (
  id         TEXT PRIMARY KEY,
  post_id    TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body       TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS messages (
  id         TEXT PRIMARY KEY,
  room_id    TEXT NOT NULL,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body       TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS events (
  id           TEXT PRIMARY KEY,
  name         TEXT NOT NULL,
  anon_id      TEXT NOT NULL,
  path         TEXT,
  campus_slug  TEXT,
  locale       TEXT,
  props        TEXT,
  referrer     TEXT,
  utm          TEXT,
  created_at   INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_posts_room          ON posts(room_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_replies_post        ON replies(post_id, created_at);
CREATE INDEX IF NOT EXISTS idx_messages_room       ON messages(room_id, created_at);
CREATE INDEX IF NOT EXISTS idx_users_campus        ON users(campus_slug);
CREATE INDEX IF NOT EXISTS idx_sessions_user       ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_events_name_created ON events(name, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_anon_created ON events(anon_id, created_at);
`;

type Handle = { db: Database.Database };

const globalForDb = globalThis as unknown as { __nihaoCampusDb?: Handle };

function open(): Handle {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  const db = new Database(DB_PATH);
  db.exec(SCHEMA);
  return { db };
}

export function getDb(): Database.Database {
  globalForDb.__nihaoCampusDb ??= open();
  return globalForDb.__nihaoCampusDb.db;
}

export function newId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
}
