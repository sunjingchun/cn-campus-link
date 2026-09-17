import { currentMember } from "@/lib/auth";
import { fail, firstIssue, json, noteWriteSchema, requireMember } from "@/lib/http";
import { createNote, isLandingStepId, listNotes, parseCampusSlug } from "@/lib/marks";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const campus = parseCampusSlug(params.get("campus") ?? "");
  const itemId = params.get("item_id") ?? "";
  if (!campus) return fail("找不到这个校区");
  if (!isLandingStepId(itemId)) return fail("找不到这一步");

  const member = await currentMember();
  if (!member) return json({ notes: [] });
  return json({ notes: listNotes(campus, itemId) });
}

export async function POST(request: Request) {
  const auth = await requireMember();
  if ("response" in auth) return auth.response;

  const parsed = noteWriteSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return fail(firstIssue(parsed.error));

  const campus = parseCampusSlug(parsed.data.campus_slug);
  if (!campus) return fail("找不到这个校区");

  const note = createNote({
    userId: auth.member.id,
    campusSlug: campus,
    itemKind: parsed.data.item_kind,
    itemId: parsed.data.item_id,
    body: parsed.data.body,
  });
  return json({ note });
}
