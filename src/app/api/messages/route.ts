import { fail, firstIssue, json, knownRoom, messageSchema, requireMember } from "@/lib/http";
import { createMessage, listMessages } from "@/lib/store";

export async function GET(request: Request) {
  const auth = await requireMember();
  if ("response" in auth) return auth.response;

  const url = new URL(request.url);
  const room = knownRoom(url.searchParams.get("room") ?? "");
  if (!room) return fail("找不到这个房间");

  const raw = url.searchParams.get("after");
  let after: number | undefined;
  if (raw !== null && raw !== "") {
    const parsed = Number(raw);
    if (!Number.isInteger(parsed) || parsed < 0) return fail("after 必须是整数");
    after = parsed;
  }

  return json({ messages: listMessages(room, { after }) });
}

export async function POST(request: Request) {
  const auth = await requireMember();
  if ("response" in auth) return auth.response;

  const parsed = messageSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return fail(firstIssue(parsed.error));

  const room = knownRoom(parsed.data.room);
  if (!room) return fail("找不到这个房间");

  const seq = createMessage({
    room,
    userId: auth.member.id,
    body: parsed.data.body,
  });

  return json({ seq });
}
