import { getCampus } from "@/data";
import { hashPassword, startSession } from "@/lib/auth";
import { campusSlug } from "@/lib/domain";
import { fail, firstIssue, json, registerSchema } from "@/lib/http";
import { createUser, emailTaken, usernameTaken } from "@/lib/store";

export async function POST(request: Request) {
  const parsed = registerSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return fail(firstIssue(parsed.error));

  const input = parsed.data;
  if (usernameTaken(input.username)) return fail("这个用户名已经有人用了", 409);
  if (emailTaken(input.email)) return fail("这个邮箱已经注册过了", 409);
  if (input.campus && !getCampus(input.campus)) return fail("找不到这个校区");

  const member = createUser({
    username: input.username,
    email: input.email,
    passwordHash: await hashPassword(input.password),
    displayName: input.displayName,
    country: input.country.toUpperCase(),
    campus: input.campus ? campusSlug(input.campus) : null,
    status: input.status,
  });

  await startSession(member.id);
  return json({ member });
}
