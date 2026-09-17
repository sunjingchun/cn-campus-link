import { CAMPUSES, getCampus } from "@/data";
import { getDb, newId } from "@/lib/db";
import {
  LANDING_STEPS,
  type CampusSlug,
  type LandingStepId,
  type PlaceSlug,
} from "@/lib/domain";

export const ITEM_KINDS = ["landing_step"] as const;
export type ItemKind = (typeof ITEM_KINDS)[number];

export const MARK_KINDS = ["planned", "done"] as const;
export type MarkKind = (typeof MARK_KINDS)[number];

export type ItemRef = {
  campusSlug: CampusSlug;
  itemKind: ItemKind;
  itemId: LandingStepId;
};

export type MineMark = {
  itemId: LandingStepId;
  kind: MarkKind;
  onDate: string | null;
};

export type StepCounts = {
  plannedThisWeek: number;
  noteCount: number;
};

export type NoteView = {
  id: string;
  body: string;
  createdAt: number;
  displayName: string;
  country: string;
  arrivalYear: number | null;
  campusSlug: CampusSlug;
  itemId: LandingStepId;
};

export type MarkDistribution = {
  itemId: LandingStepId;
  planned: number;
  done: number;
};

export function isLandingStepId(raw: string): raw is LandingStepId {
  return (LANDING_STEPS as readonly string[]).includes(raw);
}

export function isMarkKind(raw: string): raw is MarkKind {
  return (MARK_KINDS as readonly string[]).includes(raw);
}

export function parseCampusSlug(raw: string): CampusSlug | null {
  return getCampus(raw)?.slug ?? null;
}

/** Monday to Sunday in UTC+8, the calendar the checklist is written for. */
export function weekRangeUtc8(now = Date.now()): { start: string; end: string } {
  const shifted = new Date(now + 8 * 3600_000);
  const day = shifted.getUTCDay();
  const mondayDelta = day === 0 ? -6 : 1 - day;
  const monday = new Date(
    Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth(), shifted.getUTCDate() + mondayDelta),
  );
  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);
  return {
    start: monday.toISOString().slice(0, 10),
    end: sunday.toISOString().slice(0, 10),
  };
}

export function emptyCounts(): Record<LandingStepId, StepCounts> {
  return Object.fromEntries(
    LANDING_STEPS.map((id) => [id, { plannedThisWeek: 0, noteCount: 0 }]),
  ) as Record<LandingStepId, StepCounts>;
}

export function upsertMark(input: {
  anonId: string;
  userId: string | null;
  campusSlug: CampusSlug;
  itemKind: ItemKind;
  itemId: LandingStepId;
  kind: MarkKind;
  onDate: string | null;
}): void {
  getDb()
    .prepare(
      `INSERT INTO marks (anon_id, campus_slug, item_kind, item_id, user_id, kind, on_date, created_at)
       VALUES (@anonId, @campusSlug, @itemKind, @itemId, @userId, @kind, @onDate, @createdAt)
       ON CONFLICT (anon_id, campus_slug, item_kind, item_id) DO UPDATE SET
         kind = excluded.kind,
         on_date = excluded.on_date,
         user_id = COALESCE(excluded.user_id, marks.user_id)`,
    )
    .run({ ...input, createdAt: Date.now() });
}

export function deleteMark(input: { anonId: string } & ItemRef): number {
  return getDb()
    .prepare(
      `DELETE FROM marks
       WHERE anon_id = ? AND campus_slug = ? AND item_kind = ? AND item_id = ?`,
    )
    .run(input.anonId, input.campusSlug, input.itemKind, input.itemId).changes;
}

export function listMyMarks(anonId: string, campus: CampusSlug): MineMark[] {
  const rows = getDb()
    .prepare<[string, string], { item_id: string; kind: string; on_date: string | null }>(
      `SELECT item_id, kind, on_date FROM marks
       WHERE anon_id = ? AND campus_slug = ? AND item_kind = 'landing_step'`,
    )
    .all(anonId, campus);
  const mine: MineMark[] = [];
  for (const row of rows) {
    if (!isLandingStepId(row.item_id) || !isMarkKind(row.kind)) continue;
    mine.push({ itemId: row.item_id, kind: row.kind, onDate: row.on_date });
  }
  return mine;
}

export function listStepCounts(campus: CampusSlug, now = Date.now()): Record<LandingStepId, StepCounts> {
  const counts = emptyCounts();
  const { start, end } = weekRangeUtc8(now);
  const markRows = getDb()
    .prepare<[string, string, string], { itemId: string; plannedThisWeek: number }>(
      `SELECT item_id AS itemId,
              SUM(CASE WHEN kind = 'planned' AND on_date >= ? AND on_date <= ? THEN 1 ELSE 0 END) AS plannedThisWeek
       FROM marks
       WHERE campus_slug = ? AND item_kind = 'landing_step'
       GROUP BY item_id`,
    )
    .all(start, end, campus);
  const noteRows = getDb()
    .prepare<[string], { itemId: string; noteCount: number }>(
      `SELECT item_id AS itemId, COUNT(*) AS noteCount
       FROM notes
       WHERE campus_slug = ? AND item_kind = 'landing_step'
       GROUP BY item_id`,
    )
    .all(campus);

  for (const row of markRows) {
    if (!isLandingStepId(row.itemId)) continue;
    counts[row.itemId].plannedThisWeek = row.plannedThisWeek;
  }
  for (const row of noteRows) {
    if (!isLandingStepId(row.itemId)) continue;
    counts[row.itemId].noteCount = row.noteCount;
  }
  return counts;
}

export function backfillMarkUser(anonId: string, userId: string): number {
  return getDb()
    .prepare(`UPDATE marks SET user_id = ? WHERE anon_id = ? AND user_id IS NULL`)
    .run(userId, anonId).changes;
}

export function createNote(input: {
  userId: string;
  campusSlug: CampusSlug;
  itemKind: ItemKind;
  itemId: LandingStepId;
  body: string;
}): NoteView {
  const id = newId("nte");
  const createdAt = Date.now();
  getDb()
    .prepare(
      `INSERT INTO notes (id, user_id, campus_slug, item_kind, item_id, body, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(id, input.userId, input.campusSlug, input.itemKind, input.itemId, input.body, createdAt);
  const row = getDb()
    .prepare<[string], NoteRow>(
      `SELECT n.id, n.body, n.created_at, n.campus_slug, n.item_id,
              u.display_name, u.country, u.arrival_year
       FROM notes n JOIN users u ON u.id = n.user_id
       WHERE n.id = ?`,
    )
    .get(id);
  if (!row || !isLandingStepId(row.item_id)) {
    throw new Error("note insert did not round-trip");
  }
  return toNote(row);
}

type NoteRow = {
  id: string;
  body: string;
  created_at: number;
  campus_slug: string;
  item_id: string;
  display_name: string;
  country: string;
  arrival_year: number | null;
};

function toNote(row: NoteRow): NoteView {
  if (!isLandingStepId(row.item_id)) {
    throw new Error("note row has an unknown step");
  }
  return {
    id: row.id,
    body: row.body,
    createdAt: row.created_at,
    displayName: row.display_name,
    country: row.country,
    arrivalYear: row.arrival_year,
    campusSlug: row.campus_slug as CampusSlug,
    itemId: row.item_id,
  };
}

export function listNotes(campus: CampusSlug, itemId: LandingStepId): NoteView[] {
  const rows = getDb()
    .prepare<[string, string], NoteRow>(
      `SELECT n.id, n.body, n.created_at, n.campus_slug, n.item_id,
              u.display_name, u.country, u.arrival_year
       FROM notes n JOIN users u ON u.id = n.user_id
       WHERE n.campus_slug = ? AND n.item_kind = 'landing_step' AND n.item_id = ?
       ORDER BY n.created_at DESC`,
    )
    .all(campus, itemId);
  return rows.filter((row) => isLandingStepId(row.item_id)).map(toNote);
}

export function notesForPlace(slug: PlaceSlug): NoteView[] {
  const wanted = new Set<string>();
  for (const campus of CAMPUSES) {
    for (const step of LANDING_STEPS) {
      if (campus.landing[step].place === slug) {
        wanted.add(`${campus.slug}:${step}`);
      }
    }
  }
  if (wanted.size === 0) return [];

  const rows = getDb()
    .prepare<[], NoteRow>(
      `SELECT n.id, n.body, n.created_at, n.campus_slug, n.item_id,
              u.display_name, u.country, u.arrival_year
       FROM notes n JOIN users u ON u.id = n.user_id
       WHERE n.item_kind = 'landing_step'
       ORDER BY n.created_at DESC`,
    )
    .all();
  return rows
    .filter((row) => isLandingStepId(row.item_id) && wanted.has(`${row.campus_slug}:${row.item_id}`))
    .map(toNote);
}

export function markDistribution(): MarkDistribution[] {
  const rows = getDb()
    .prepare<[], { itemId: string; planned: number; done: number }>(
      `SELECT item_id AS itemId,
              SUM(CASE WHEN kind = 'planned' THEN 1 ELSE 0 END) AS planned,
              SUM(CASE WHEN kind = 'done' THEN 1 ELSE 0 END) AS done
       FROM marks
       WHERE item_kind = 'landing_step'
       GROUP BY item_id
       ORDER BY item_id`,
    )
    .all();
  return rows
    .filter((row): row is { itemId: LandingStepId; planned: number; done: number } =>
      isLandingStepId(row.itemId),
    )
    .map((row) => ({ itemId: row.itemId, planned: row.planned, done: row.done }));
}

export function totalNotes(): number {
  return getDb().prepare<[], { n: number }>(`SELECT COUNT(*) AS n FROM notes`).get()!.n;
}
