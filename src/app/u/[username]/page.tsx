import Link from "next/link";
import { notFound } from "next/navigation";
import { SignInButton } from "@/components/member/auth-cta";
import { ContactLinks } from "@/components/member/contact-links";
import { StatusBadge } from "@/components/member/member-card";
import { hasVisibleLinks } from "@/components/member/types";
import { MemberAvatar } from "@/components/shared/member-avatar";
import { relativeTime } from "@/components/social/relative-time";
import { campusLabel, getCampus, roomTitle } from "@/data";
import { currentMember } from "@/lib/auth";
import { countryLabel, countryZh, flagOf } from "@/lib/countries";
import { DEGREE_LEVEL_META, POST_CATEGORY_META, parseRoom } from "@/lib/domain";
import { findMemberByUsername, recentPosts } from "@/lib/store";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const member = findMemberByUsername(username, false);
  if (!member) return { title: "未找到成员" };
  return { title: `${member.displayName} (@${member.username})` };
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const viewer = await currentMember();
  const member = findMemberByUsername(username, viewer !== null);
  if (!member) notFound();

  const campus = member.campus ? getCampus(member.campus) : undefined;
  const threads = recentPosts(viewer !== null, 80).filter(
    (post) => post.author.username === member.username,
  );

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <header className="rounded-2xl bg-card p-5 ring-1 ring-foreground/8 sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <MemberAvatar
            name={member.displayName}
            hue={member.avatarHue}
            country={member.country}
            size="xl"
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">{member.displayName}</h1>
              <StatusBadge status={member.status} />
            </div>
            <p className="mt-1 text-sm text-muted-foreground">@{member.username}</p>
            <p className="mt-2 text-sm">
              {flagOf(member.country)} {countryZh(member.country)}
              <span className="text-muted-foreground"> · {countryLabel(member.country)}</span>
            </p>
            <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
              {campus ? (
                <div>
                  <dt className="text-xs text-muted-foreground">校区</dt>
                  <dd>
                    <Link href={`/campus/${campus.slug}`} className="font-medium text-primary hover:underline">
                      {campusLabel(campus)}
                    </Link>
                  </dd>
                </div>
              ) : null}
              {member.program ? (
                <div>
                  <dt className="text-xs text-muted-foreground">专业</dt>
                  <dd>{member.program}</dd>
                </div>
              ) : null}
              {member.level ? (
                <div>
                  <dt className="text-xs text-muted-foreground">层次</dt>
                  <dd>
                    {DEGREE_LEVEL_META[member.level].zh}
                    <span className="text-muted-foreground"> · {DEGREE_LEVEL_META[member.level].en}</span>
                  </dd>
                </div>
              ) : null}
              {member.arrivalYear ? (
                <div>
                  <dt className="text-xs text-muted-foreground">入学年份</dt>
                  <dd>{member.arrivalYear}</dd>
                </div>
              ) : null}
            </dl>
          </div>
        </div>

        {member.languages.length > 0 ? (
          <section className="mt-6">
            <h2 className="text-xs font-medium tracking-[0.14em] text-muted-foreground">语言 LANGUAGES</h2>
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {member.languages.map((item) => (
                <li
                  key={item}
                  className="rounded-full bg-secondary px-2.5 py-1 text-xs text-secondary-foreground"
                >
                  {item}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {member.interests.length > 0 ? (
          <section className="mt-5">
            <h2 className="text-xs font-medium tracking-[0.14em] text-muted-foreground">兴趣 INTERESTS</h2>
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {member.interests.map((item) => (
                <li
                  key={item}
                  className="rounded-full bg-secondary px-2.5 py-1 text-xs text-secondary-foreground"
                >
                  {item}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {member.bio ? (
          <section className="mt-5">
            <h2 className="text-xs font-medium tracking-[0.14em] text-muted-foreground">介绍 BIO</h2>
            <p className="mt-2 text-sm leading-7">{member.bio}</p>
          </section>
        ) : null}

        <section className="mt-5">
          <h2 className="text-xs font-medium tracking-[0.14em] text-muted-foreground">联系 CONTACT</h2>
          {viewer ? (
            hasVisibleLinks(member.links) && member.links ? (
              <div className="mt-2">
                <ContactLinks links={member.links} />
              </div>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">还没有留下联系方式。</p>
            )
          ) : (
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span>登录后才能看到联系方式。</span>
              <SignInButton reason="登录后才能看到联系方式" />
            </div>
          )}
        </section>
      </header>

      <section className="mt-8">
        <h2 className="text-lg font-semibold tracking-tight">TA 发过的帖</h2>
        {threads.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-dashed border-border bg-card/70 px-4 py-10 text-center text-sm text-muted-foreground">
            还没有在任何房间发过帖。
          </p>
        ) : (
          <ul className="mt-3 space-y-3">
            {threads.map((post) => {
              const room = parseRoom(post.room);
              const category = POST_CATEGORY_META[post.category];
              return (
                <li key={post.id} className="rounded-2xl bg-card p-4 ring-1 ring-foreground/8">
                  <div className="mb-1.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="rounded-full bg-secondary px-2 py-0.5 font-medium text-secondary-foreground">
                      {category.emoji} {category.zh}
                    </span>
                    <span>{room ? roomTitle(room) : post.room}</span>
                    <span>{relativeTime(post.createdAt)}</span>
                    <span>{post.replyCount} 条回复</span>
                  </div>
                  <p className="font-medium tracking-tight">{post.title}</p>
                  <p className="mt-1 line-clamp-3 text-sm leading-6 text-muted-foreground">{post.body}</p>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
