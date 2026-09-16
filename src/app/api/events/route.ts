import { eventInputSchema, ensureAnonId, recordEvent } from "@/lib/events";
import { fail, firstIssue } from "@/lib/http";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  const parsed = eventInputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return fail(firstIssue(parsed.error));

  const anonId = await ensureAnonId();
  recordEvent(parsed.data, anonId);
  return new Response(null, { status: 204 });
}
