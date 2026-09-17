import type { BoardAuthor, BoardPostModel } from "@/components/member/types";
import { CommunityTabs } from "@/components/social/community-tabs";
import { copy, fill } from "@/lib/copy";
import { roomTitle } from "@/data";
import { currentMember } from "@/lib/auth";
import { type Room, roomId } from "@/lib/domain";
import { t, type Locale } from "@/lib/locale";
import { type BoardPost, listPosts, type Member } from "@/lib/store";

function authorOf(member: Member): BoardAuthor {
  return {
    username: member.username,
    displayName: member.displayName,
    country: member.country,
    avatarHue: member.avatarHue,
  };
}

function postOf(post: BoardPost): BoardPostModel {
  return {
    id: post.id,
    category: post.category,
    title: post.title,
    body: post.body,
    createdAt: post.createdAt,
    replyCount: post.replyCount,
    author: authorOf(post.author),
  };
}

export async function CampusSocial({ room, locale }: { room: Room; locale: Locale }) {
  const viewer = await currentMember();
  const signedIn = viewer !== null;
  const id = roomId(room);
  const posts = listPosts(id, signedIn).map(postOf);
  const title = roomTitle(room, locale);

  return (
    <section id="community" className="scroll-mt-24">
      <div className="mb-5">
        <p className="text-xs font-medium tracking-[0.18em] text-primary">{t(copy.community, locale)}</p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight">{t(copy.meetHere, locale)}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{fill(copy.boardOf, locale, { title })}</p>
      </div>
      <CommunityTabs roomId={id} posts={posts} />
    </section>
  );
}
