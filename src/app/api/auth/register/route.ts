import { hashPassword, startSession } from "@/lib/auth";
import { readAnonId } from "@/lib/events";
import { fail, firstIssue, json, registerSchema } from "@/lib/http";
import { backfillMarkUser } from "@/lib/marks";
import { allocateUsername, createUser, emailTaken } from "@/lib/store";

export async function POST(request: Request) {
  const parsed = registerSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return fail(firstIssue(parsed.error));

  const input = parsed.data;
  if (emailTaken(input.email)) return fail("这个邮箱已经注册过了", 409);

  const username = allocateUsername(input.email);
  const member = createUser({
    username,
    email: input.email,
    passwordHash: await hashPassword(input.password),
    displayName: input.displayName,
    country: "",
    campus: null,
    status: "exploring",
  });

  const anonId = await readAnonId();
  if (anonId) backfillMarkUser(anonId, member.id);

  await startSession(member.id);
  return json({ member });
}
