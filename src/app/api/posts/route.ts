import { fail, firstIssue, json, knownRoom, postSchema, requireMember } from "@/lib/http";
import { createPost } from "@/lib/store";

export async function POST(request: Request) {
  const auth = await requireMember();
  if ("response" in auth) return auth.response;

  const parsed = postSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return fail(firstIssue(parsed.error));

  const room = knownRoom(parsed.data.room);
  if (!room) return fail("找不到这个房间");

  const id = createPost({
    room,
    userId: auth.member.id,
    category: parsed.data.category,
    title: parsed.data.title,
    body: parsed.data.body,
  });

  return json({ id });
}
