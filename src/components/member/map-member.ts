import type { MemberCardModel } from "@/components/member/types";
import { campusLabel, getCampus } from "@/data";
import type { Member } from "@/lib/store";

export function toMemberCard(member: Member): MemberCardModel {
  const campus = member.campus ? getCampus(member.campus) : undefined;
  return {
    username: member.username,
    displayName: member.displayName,
    country: member.country,
    campus: member.campus,
    campusLabel: campus ? campusLabel(campus, "en") : null,
    status: member.status,
    arrivalYear: member.arrivalYear,
    program: member.program,
    avatarHue: member.avatarHue,
    links: member.links,
  };
}
