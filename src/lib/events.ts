import { cookies } from "next/headers";
import { z } from "zod";
import { getDb, newId } from "@/lib/db";
import {
  EVENT_NAMES,
  FUNNEL_EVENT_NAMES,
  INTENT_EVENT_NAMES,
  type EventName,
} from "@/lib/domain";

/**
 * Anonymous visitor cookie. Random, no personal data, httpOnly, one year.
 * Next only lets Route Handlers set cookies, so this is minted on POST /api/events.
 */
export const ANON_COOKIE = "nhc_anon";
export const ANON_TTL_MS = 365 * 24 * 60 * 60 * 1000;
export const EVENTS_PER_MINUTE = 60;

const RATE_WINDOW_MS = 60_000;
export const ANON_RE = /^anon_[a-f0-9]{16}$/;

export async function readAnonId(): Promise<string | null> {
  const jar = await cookies();
  const existing = jar.get(ANON_COOKIE)?.value;
  if (existing && ANON_RE.test(existing)) return existing;
  return null;
}

const emptyToNull = (value: string | null | undefined): string | null => {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

export const eventInputSchema = z.object({
  name: z.enum(EVENT_NAMES),
  path: z.string().trim().max(500).optional().nullable(),
  campus_slug: z.string().trim().max(80).optional().nullable(),
  locale: z.string().trim().max(16).optional().nullable(),
  referrer: z.string().trim().max(500).optional().nullable(),
  utm: z.string().trim().max(80).optional().nullable(),
  props: z
    .record(z.string().max(40), z.union([z.string().max(200), z.number(), z.boolean()]))
    .optional()
    .nullable(),
});

export type EventInput = z.infer<typeof eventInputSchema>;

export async function ensureAnonId(): Promise<string> {
  const jar = await cookies();
  const existing = jar.get(ANON_COOKIE)?.value;
  if (existing && ANON_RE.test(existing)) return existing;

  const id = newId("anon");
  jar.set(ANON_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ANON_TTL_MS / 1000,
  });
  return id;
}

export type Recorded = "ok" | "dropped";

export function recordEvent(input: EventInput, anonId: string): Recorded {
  const db = getDb();
  return db.transaction((): Recorded => {
    const recent = db
      .prepare<[string, number], { n: number }>(
        `SELECT COUNT(*) AS n FROM events WHERE anon_id = ? AND created_at > ?`,
      )
      .get(anonId, Date.now() - RATE_WINDOW_MS)!.n;
    if (recent >= EVENTS_PER_MINUTE) return "dropped";

    const props = input.props && Object.keys(input.props).length > 0 ? JSON.stringify(input.props) : null;
    db.prepare(
      `INSERT INTO events (id, name, anon_id, path, campus_slug, locale, props, referrer, utm, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      newId("evt"),
      input.name,
      anonId,
      emptyToNull(input.path),
      emptyToNull(input.campus_slug),
      emptyToNull(input.locale),
      props,
      emptyToNull(input.referrer)?.split("?")[0] ?? null,
      emptyToNull(input.utm),
      Date.now(),
    );
    return "ok";
  })();
}

export type DailyCount = { day: string; name: EventName; count: number };
export type SourceCount = { kind: "utm" | "referrer"; value: string; count: number };
export type FunnelStage = { stage: string; users: number };
export type IntentCount = { name: (typeof INTENT_EVENT_NAMES)[number]; count: number };

export type MetricsSnapshot = {
  daily: DailyCount[];
  sources: SourceCount[];
  funnel: FunnelStage[];
  intent: IntentCount[];
};

export function loadMetrics(): MetricsSnapshot {
  const db = getDb();
  const dailyRows = db
    .prepare<[], { day: string; name: string; count: number }>(
      `SELECT strftime('%Y-%m-%d', created_at / 1000, 'unixepoch') AS day,
              name,
              COUNT(*) AS count
       FROM events
       GROUP BY 1, 2
       ORDER BY 1 DESC, 2`,
    )
    .all();

  const daily: DailyCount[] = dailyRows
    .filter((row): row is { day: string; name: EventName; count: number } =>
      (EVENT_NAMES as readonly string[]).includes(row.name),
    )
    .map((row) => ({ day: row.day, name: row.name, count: row.count }));

  const utmRows = db
    .prepare<[], { value: string; count: number }>(
      `SELECT COALESCE(NULLIF(utm, ''), '(none)') AS value, COUNT(*) AS count
       FROM events GROUP BY 1 ORDER BY count DESC, value`,
    )
    .all();
  const referrerRows = db
    .prepare<[], { value: string; count: number }>(
      `SELECT COALESCE(NULLIF(referrer, ''), '(none)') AS value, COUNT(*) AS count
       FROM events GROUP BY 1 ORDER BY count DESC, value`,
    )
    .all();

  const sources: SourceCount[] = [
    ...utmRows.map((row) => ({ kind: "utm" as const, value: row.value, count: row.count })),
    ...referrerRows.map((row) => ({ kind: "referrer" as const, value: row.value, count: row.count })),
  ];

  const funnel: FunnelStage[] = FUNNEL_EVENT_NAMES.map((name) => ({
    stage: name,
    users: db
      .prepare<[string], { n: number }>(`SELECT COUNT(DISTINCT anon_id) AS n FROM events WHERE name = ?`)
      .get(name)!.n,
  }));

  const returnUsers = db
    .prepare<[], { n: number }>(
      `SELECT COUNT(DISTINCT later.anon_id) AS n
       FROM events done
       JOIN events later
         ON later.anon_id = done.anon_id
        AND later.created_at > done.created_at
        AND later.created_at <= done.created_at + 604800000
       WHERE done.name = 'step_done'`,
    )
    .get()!.n;
  funnel.push({ stage: "return_7d", users: returnUsers });

  const intent: IntentCount[] = INTENT_EVENT_NAMES.map((name) => ({
    name,
    count: db.prepare<[string], { n: number }>(`SELECT COUNT(*) AS n FROM events WHERE name = ?`).get(name)!.n,
  }));

  return { daily, sources, funnel, intent };
}
