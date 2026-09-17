import { currentMember } from "@/lib/auth";
import { ensureAnonId, readAnonId } from "@/lib/events";
import { fail, firstIssue, json, markDeleteSchema, markWriteSchema } from "@/lib/http";
import {
  deleteMark,
  listMyMarks,
  listStepCounts,
  parseCampusSlug,
  upsertMark,
} from "@/lib/marks";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const campus = parseCampusSlug(new URL(request.url).searchParams.get("campus") ?? "");
  if (!campus) return fail("找不到这个校区");

  const anonId = await readAnonId();
  return json({
    mine: anonId ? listMyMarks(anonId, campus) : [],
    counts: listStepCounts(campus),
  });
}

export async function POST(request: Request) {
  const parsed = markWriteSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return fail(firstIssue(parsed.error));

  const campus = parseCampusSlug(parsed.data.campus_slug);
  if (!campus) return fail("找不到这个校区");

  const anonId = await ensureAnonId();
  const member = await currentMember();
  upsertMark({
    anonId,
    userId: member?.id ?? null,
    campusSlug: campus,
    itemKind: parsed.data.item_kind,
    itemId: parsed.data.item_id,
    kind: parsed.data.kind,
    onDate: parsed.data.on_date,
  });
  return json({ ok: true });
}

export async function DELETE(request: Request) {
  const parsed = markDeleteSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return fail(firstIssue(parsed.error));

  const campus = parseCampusSlug(parsed.data.campus_slug);
  if (!campus) return fail("找不到这个校区");

  const anonId = await readAnonId();
  if (anonId) {
    deleteMark({
      anonId,
      campusSlug: campus,
      itemKind: parsed.data.item_kind,
      itemId: parsed.data.item_id,
    });
  }
  return json({ ok: true });
}
