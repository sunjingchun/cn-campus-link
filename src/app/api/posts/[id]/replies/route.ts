import { currentMember } from "@/lib/auth";
import { fail, firstIssue, json, replySchema, requireMember } from "@/lib/http";
import { createReply, listReplies, postExists } from "@/lib/store";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const viewer = await currentMember();
  return json({ replies: listReplies(id, viewer !== null) });
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireMember();
  if ("response" in auth) return auth.response;

  const { id } = await context.params;
  const parsed = replySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return fail(firstIssue(parsed.error));
  if (!postExists(id)) return fail("帖子不存在", 404);

  const replyId = createReply({
    postId: id,
    userId: auth.member.id,
    body: parsed.data.body,
  });

  return json({ id: replyId });
}
