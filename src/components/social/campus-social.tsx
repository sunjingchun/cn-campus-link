import { toMemberCard } from "@/components/member/map-member";
import type { BoardAuthor, BoardPostModel } from "@/components/member/types";
import { CommunityTabs } from "@/components/social/community-tabs";
import { campusesOfCity, roomTitle } from "@/data";
import { currentMember } from "@/lib/auth";
import { type Room, roomId } from "@/lib/domain";
import { type BoardPost, listMembers, listPosts, type Member } from "@/lib/store";

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

export async function CampusSocial({ room }: { room: Room }) {
  const viewer = await currentMember();
  const signedIn = viewer !== null;
  const id = roomId(room);
  const posts = listPosts(id, signedIn).map(postOf);
  const campuses =
    room.kind === "campus" ? [room.campus] : campusesOfCity(room.city).map((campus) => campus.slug);
  const members =
    campuses.length > 0 ? listMembers({ campuses, limit: 80 }, signedIn).map(toMemberCard) : [];
  const title = roomTitle(room);

  return (
    <section id="community" className="scroll-mt-24">
      <div className="mb-5">
        <p className="text-xs font-medium tracking-[0.18em] text-primary">社区 COMMUNITY</p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight">在这里见面</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {title} 的留言板，以及已经报到的人
        </p>
      </div>
      <CommunityTabs
        roomId={id}
        roomLabel={title}
        kind={room.kind}
        posts={posts}
        members={members}
      />
    </section>
  );
}
