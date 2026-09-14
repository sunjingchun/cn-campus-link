import { MembersDirectory } from "@/components/member/members-directory";
import { toMemberCard } from "@/components/member/map-member";
import { CITIES, campusOptions, cityOfCampus } from "@/data";
import { currentMember } from "@/lib/auth";
import { campusSlug } from "@/lib/domain";
import { communityStats, listMembers } from "@/lib/store";

export const metadata = {
  title: "成员",
  description: "已经在中国读书、即将到来、或者还在选校的留学生。",
};

export default async function MembersPage() {
  const viewer = await currentMember();
  const stats = communityStats();
  const members = listMembers({ limit: 200 }, viewer !== null).map(toMemberCard);
  const campuses = campusOptions().map((option) => ({
    ...option,
    citySlug: cityOfCampus(campusSlug(option.slug))?.slug ?? "",
  }));

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <header className="mb-8 max-w-2xl">
        <p className="text-xs font-medium tracking-[0.18em] text-primary">成员 MEMBERS</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">已经在这里的人</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {stats.members} 位留学生 · 来自 {stats.countries} 个国家。点进主页能看到他们读什么、哪年来的，登录后还能看到联系方式。
        </p>
      </header>
      <MembersDirectory
        members={members}
        cities={CITIES.map((city) => ({ slug: city.slug, name: city.name }))}
        campuses={campuses}
        stats={{ members: stats.members, countries: stats.countries }}
      />
    </div>
  );
}
