import Link from "next/link";
import { notFound } from "next/navigation";
import { SignInButton } from "@/components/member/auth-cta";
import { ContactLinks } from "@/components/member/contact-links";
import { StatusBadge } from "@/components/member/member-card";
import { hasVisibleLinks } from "@/components/member/types";
import { MemberAvatar } from "@/components/shared/member-avatar";
import { relativeTime } from "@/components/social/relative-time";
import { campusLabel, getCampus, roomTitle } from "@/data";
import { copy, fill } from "@/lib/copy";
import { currentMember } from "@/lib/auth";
import { countryLabel, flagOf } from "@/lib/countries";
import { DEGREE_LEVEL_META, POST_CATEGORY_META, parseRoom } from "@/lib/domain";
import { t } from "@/lib/locale";
import { readLocale } from "@/lib/read-locale";
import { findMemberByUsername, recentPosts } from "@/lib/store";
import { Cjk } from "@/components/site/locale-switch";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const member = findMemberByUsername(username, false);
  if (!member) return { title: "Member" };
  return { title: `${member.displayName} (@${member.username})` };
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const locale = await readLocale();
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
              {flagOf(member.country)} {countryLabel(member.country, locale)}
            </p>
            <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
              {campus ? (
                <div>
                  <dt className="text-xs text-muted-foreground">{t(copy.campuses, locale)}</dt>
                  <dd>
                    <Link href={`/campus/${campus.slug}`} className="font-medium text-primary hover:underline">
                      {campusLabel(campus, locale)}
                    </Link>
                  </dd>
                </div>
              ) : null}
              {member.program ? (
                <div>
                  <dt className="text-xs text-muted-foreground">{t(copy.program, locale)}</dt>
                  <dd>{member.program}</dd>
                </div>
              ) : null}
              {member.level ? (
                <div>
                  <dt className="text-xs text-muted-foreground">{t(copy.level, locale)}</dt>
                  <dd>
                    {t(DEGREE_LEVEL_META[member.level], locale)}
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
                      {category.emoji} {t(category, locale)}
                    </span>
                    <span>{room ? roomTitle(room, locale) : post.room}</span>
                    <span>{relativeTime(post.createdAt, locale)}</span>
                    <span>{fill(copy.replies, locale, { n: post.replyCount })}</span>
                  </div>
                  <p className="font-medium tracking-tight">
                    <Cjk>{post.title}</Cjk>
                  </p>
                  <p className="mt-1 line-clamp-3 text-sm leading-6 text-muted-foreground">
                    <Cjk>{post.body}</Cjk>
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
