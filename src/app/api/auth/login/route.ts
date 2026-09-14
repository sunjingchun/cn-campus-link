import { startSession, verifyPassword } from "@/lib/auth";
import { fail, firstIssue, json, loginSchema } from "@/lib/http";
import { findAuthRow, findMemberById } from "@/lib/store";

export async function POST(request: Request) {
  const parsed = loginSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return fail(firstIssue(parsed.error));

  const row = findAuthRow(parsed.data.identifier);
  if (!row || !(await verifyPassword(parsed.data.password, row.password_hash))) {
    return fail("邮箱/用户名或密码不对", 401);
  }

  await startSession(row.id);
  return json({ member: findMemberById(row.id, true) });
}
