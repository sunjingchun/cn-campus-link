import { getDb, newId } from "@/lib/db";
import {
  campusSlug,
  type CampusSlug,
  type DegreeLevel,
  DEGREE_LEVELS,
  type MemberStatus,
  MEMBER_STATUSES,
  type PostCategory,
  POST_CATEGORIES,
  type RoomId,
} from "@/lib/domain";

/**
 * Every read and write of member-generated data. Rows are parsed into domain
 * objects here, so nothing above this module deals with JSON columns or
 * snake_case, and contact details never leave without an explicit decision.
 */

export type MemberLinks = {
  wechat: string | null;
  instagram: string | null;
  email: string | null;
};

export type Member = {
  id: string;
  username: string;
  displayName: string;
  country: string;
  campus: CampusSlug | null;
  status: MemberStatus;
  arrivalYear: number | null;
  program: string;
  level: DegreeLevel | null;
  languages: string[];
  interests: string[];
  bio: string;
  avatarHue: number;
  createdAt: number;
  /** Null for signed-out visitors. Members share contacts with members only. */
  links: MemberLinks | null;
};

export type BoardReply = {
  id: string;
  body: string;
  createdAt: number;
  author: Member;
};

export type BoardPost = {
  id: string;
  room: RoomId;
  category: PostCategory;
  title: string;
  body: string;
  createdAt: number;
  author: Member;
  replyCount: number;
};

type UserRow = {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  display_name: string;
  country: string;
  campus_slug: string | null;
  status: string;
  arrival_year: number | null;
  program: string;
  level: string | null;
  languages: string;
  interests: string;
  bio: string;
  link_wechat: string | null;
  link_instagram: string | null;
  link_email: string | null;
  avatar_hue: number;
  created_at: number;
};

const USER_COLUMNS = `u.id, u.username, u.email, u.password_hash, u.display_name, u.country,
  u.campus_slug, u.status, u.arrival_year, u.program, u.level, u.languages, u.interests,
  u.bio, u.link_wechat, u.link_instagram, u.link_email, u.avatar_hue, u.created_at`;

function oneOf<T extends string>(allowed: readonly T[], raw: string | null, fallback: T): T {
  return allowed.includes(raw as T) ? (raw as T) : fallback;
}

function oneOfOrNull<T extends string>(allowed: readonly T[], raw: string | null): T | null {
  return allowed.includes(raw as T) ? (raw as T) : null;
}

function stringList(raw: string): string[] {
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return [];
  }
}

function toMember(row: UserRow, includeContact: boolean): Member {
  return {
    id: row.id,
    username: row.username,
    displayName: row.display_name,
    country: row.country,
    campus: row.campus_slug ? campusSlug(row.campus_slug) : null,
    status: oneOf(MEMBER_STATUSES, row.status, "exploring"),
    arrivalYear: row.arrival_year,
    program: row.program,
    level: oneOfOrNull(DEGREE_LEVELS, row.level),
    languages: stringList(row.languages),
    interests: stringList(row.interests),
    bio: row.bio,
    avatarHue: row.avatar_hue,
    createdAt: row.created_at,
    links: includeContact
      ? { wechat: row.link_wechat, instagram: row.link_instagram, email: row.link_email }
      : null,
  };
}

/* -------------------------------------------------------------------------- */
/* Accounts                                                                   */
/* -------------------------------------------------------------------------- */

export type NewAccount = {
  username: string;
  email: string;
  passwordHash: string;
  displayName: string;
  country: string;
  campus: CampusSlug | null;
  status: MemberStatus;
};

export function createUser(input: NewAccount): Member {
  const db = getDb();
  const id = newId("usr");
  db.prepare(
    `INSERT INTO users (id, username, email, password_hash, display_name, country,
       campus_slug, status, avatar_hue, created_at)
     VALUES (@id, @username, @email, @passwordHash, @displayName, @country,
       @campus, @status, @hue, @createdAt)`,
  ).run({
    id,
    username: input.username,
    email: input.email,
    passwordHash: input.passwordHash,
    displayName: input.displayName,
    country: input.country,
    campus: input.campus,
    status: input.status,
    hue: Math.floor(Math.random() * 360),
    createdAt: Date.now(),
  });
  return findMemberById(id, true)!;
}

export function findAuthRow(emailOrUsername: string): UserRow | null {
  const row = getDb()
    .prepare<[string, string], UserRow>(
      `SELECT ${USER_COLUMNS} FROM users u WHERE u.email = ? OR u.username = ? LIMIT 1`,
    )
    .get(emailOrUsername.toLowerCase(), emailOrUsername.toLowerCase());
  return row ?? null;
}

export function allocateUsername(email: string): string {
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
  while (usernameTaken(candidate)) {
    const suffix = String(n);
    candidate = `${base.slice(0, Math.max(1, 20 - suffix.length))}${suffix}`;
    n += 1;
  }
  return candidate;
}

export function usernameTaken(username: string): boolean {
  return (
    getDb().prepare<[string], { n: number }>(`SELECT COUNT(*) AS n FROM users WHERE username = ?`)
      .get(username.toLowerCase())!.n > 0
  );
}

export function emailTaken(email: string): boolean {
  return (
    getDb().prepare<[string], { n: number }>(`SELECT COUNT(*) AS n FROM users WHERE email = ?`)
      .get(email.toLowerCase())!.n > 0
  );
}

export function findMemberById(id: string, includeContact: boolean): Member | null {
  const row = getDb()
    .prepare<[string], UserRow>(`SELECT ${USER_COLUMNS} FROM users u WHERE u.id = ?`)
    .get(id);
  return row ? toMember(row, includeContact) : null;
}

export function findMemberByUsername(username: string, includeContact: boolean): Member | null {
  const row = getDb()
    .prepare<[string], UserRow>(`SELECT ${USER_COLUMNS} FROM users u WHERE u.username = ?`)
    .get(username.toLowerCase());
  return row ? toMember(row, includeContact) : null;
}

export type ProfileUpdate = {
  displayName: string;
  country: string;
  campus: CampusSlug | null;
  status: MemberStatus;
  arrivalYear: number | null;
  program: string;
  level: DegreeLevel | null;
  languages: string[];
  interests: string[];
  bio: string;
  links: MemberLinks;
};

export function updateProfile(userId: string, update: ProfileUpdate): Member {
  getDb()
    .prepare(
      `UPDATE users SET display_name = @displayName, country = @country, campus_slug = @campus,
         status = @status, arrival_year = @arrivalYear, program = @program, level = @level,
         languages = @languages, interests = @interests, bio = @bio,
         link_wechat = @wechat, link_instagram = @instagram, link_email = @email
       WHERE id = @id`,
    )
    .run({
      id: userId,
      displayName: update.displayName,
      country: update.country,
      campus: update.campus,
      status: update.status,
      arrivalYear: update.arrivalYear,
      program: update.program,
      level: update.level,
      languages: JSON.stringify(update.languages),
      interests: JSON.stringify(update.interests),
      bio: update.bio,
      wechat: update.links.wechat,
      instagram: update.links.instagram,
      email: update.links.email,
    });
  return findMemberById(userId, true)!;
}

/* -------------------------------------------------------------------------- */
/* Sessions                                                                   */
/* -------------------------------------------------------------------------- */

export function createSession(userId: string, token: string, ttlMs: number): void {
  const now = Date.now();
  getDb()
    .prepare(
      `INSERT INTO sessions (token, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)`,
    )
    .run(token, userId, now, now + ttlMs);
}

export function memberForSession(token: string): Member | null {
  const row = getDb()
    .prepare<[string, number], UserRow>(
      `SELECT ${USER_COLUMNS} FROM sessions s JOIN users u ON u.id = s.user_id
       WHERE s.token = ? AND s.expires_at > ?`,
    )
    .get(token, Date.now());
  return row ? toMember(row, true) : null;
}

export function deleteSession(token: string): void {
  getDb().prepare(`DELETE FROM sessions WHERE token = ?`).run(token);
}

export type CommunityStats = {
  members: number;
  countries: number;
  posts: number;
};

export function communityStats(): CommunityStats {
  const db = getDb();
  const scalar = (sql: string) => db.prepare<[], { n: number }>(sql).get()!.n;
  return {
    members: scalar(`SELECT COUNT(*) AS n FROM users`),
    countries: scalar(`SELECT COUNT(DISTINCT country) AS n FROM users WHERE country <> ''`),
    posts: scalar(`SELECT COUNT(*) AS n FROM posts`),
  };
}

/* -------------------------------------------------------------------------- */
/* Board                                                                      */
/* -------------------------------------------------------------------------- */

type PostRow = UserRow & {
  post_id: string;
  room_id: string;
  category: string;
  title: string;
  body: string;
  post_created_at: number;
  reply_count: number;
};

function toPost(row: PostRow, includeContact: boolean): BoardPost {
  return {
    id: row.post_id,
    room: row.room_id as RoomId,
    category: oneOf(POST_CATEGORIES, row.category, "question"),
    title: row.title,
    body: row.body,
    createdAt: row.post_created_at,
    replyCount: row.reply_count,
    author: toMember(row, includeContact),
  };
}

export function listPosts(room: RoomId, includeContact: boolean, limit = 30): BoardPost[] {
  const rows = getDb()
    .prepare<[string, number], PostRow>(
      `SELECT ${USER_COLUMNS}, p.id AS post_id, p.room_id, p.category, p.title, p.body,
         p.created_at AS post_created_at,
         (SELECT COUNT(*) FROM replies r WHERE r.post_id = p.id) AS reply_count
       FROM posts p JOIN users u ON u.id = p.user_id
       WHERE p.room_id = ? ORDER BY p.created_at DESC LIMIT ?`,
    )
    .all(room, limit);
  return rows.map((row) => toPost(row, includeContact));
}

export function recentPosts(includeContact: boolean, limit = 12): BoardPost[] {
  const rows = getDb()
    .prepare<[number], PostRow>(
      `SELECT ${USER_COLUMNS}, p.id AS post_id, p.room_id, p.category, p.title, p.body,
         p.created_at AS post_created_at,
         (SELECT COUNT(*) FROM replies r WHERE r.post_id = p.id) AS reply_count
       FROM posts p JOIN users u ON u.id = p.user_id
       ORDER BY p.created_at DESC LIMIT ?`,
    )
    .all(limit);
  return rows.map((row) => toPost(row, includeContact));
}

export function createPost(input: {
  room: RoomId;
  userId: string;
  category: PostCategory;
  title: string;
  body: string;
}): string {
  const id = newId("pst");
  getDb()
    .prepare(
      `INSERT INTO posts (id, room_id, user_id, category, title, body, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(id, input.room, input.userId, input.category, input.title, input.body, Date.now());
  return id;
}

export function listReplies(postId: string, includeContact: boolean): BoardReply[] {
  const rows = getDb()
    .prepare<[string], UserRow & { reply_id: string; body: string; reply_created_at: number }>(
      `SELECT ${USER_COLUMNS}, r.id AS reply_id, r.body, r.created_at AS reply_created_at
       FROM replies r JOIN users u ON u.id = r.user_id
       WHERE r.post_id = ? ORDER BY r.created_at ASC`,
    )
    .all(postId);
  return rows.map((row) => ({
    id: row.reply_id,
    body: row.body,
    createdAt: row.reply_created_at,
    author: toMember(row, includeContact),
  }));
}

export function createReply(input: { postId: string; userId: string; body: string }): string {
  const id = newId("rpl");
  getDb()
    .prepare(`INSERT INTO replies (id, post_id, user_id, body, created_at) VALUES (?, ?, ?, ?, ?)`)
    .run(id, input.postId, input.userId, input.body, Date.now());
  return id;
}

export function postExists(postId: string): boolean {
  return (
    getDb().prepare<[string], { n: number }>(`SELECT COUNT(*) AS n FROM posts WHERE id = ?`).get(postId)!
      .n > 0
  );
}

export function countPostsByRoom(): Map<string, number> {
  const rows = getDb()
    .prepare<[], { room_id: string; n: number }>(
      `SELECT room_id, COUNT(*) AS n FROM posts GROUP BY room_id`,
    )
    .all();
  return new Map(rows.map((row) => [row.room_id, row.n]));
}
