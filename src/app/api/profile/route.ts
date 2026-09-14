import { getCampus } from "@/data";
import { campusSlug } from "@/lib/domain";
import { fail, firstIssue, json, profileSchema, requireMember } from "@/lib/http";
import { updateProfile } from "@/lib/store";

export async function PUT(request: Request) {
  const auth = await requireMember();
  if ("response" in auth) return auth.response;

  const parsed = profileSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return fail(firstIssue(parsed.error));

  if (parsed.data.campus && !getCampus(parsed.data.campus)) {
    return fail("找不到这个校区");
  }

  const member = updateProfile(auth.member.id, {
    displayName: parsed.data.displayName,
    country: parsed.data.country,
    campus: parsed.data.campus ? campusSlug(parsed.data.campus) : null,
    status: parsed.data.status,
    arrivalYear: parsed.data.arrivalYear,
    program: parsed.data.program,
    level: parsed.data.level,
    languages: parsed.data.languages,
    interests: parsed.data.interests,
    bio: parsed.data.bio,
    links: parsed.data.links,
  });

  return json({ member });
}
