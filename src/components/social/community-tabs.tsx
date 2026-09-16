import type { BoardPostModel } from "@/components/member/types";
import { BoardPanel } from "@/components/social/board-panel";

export function CommunityTabs({
  roomId,
  posts,
}: {
  roomId: string;
  posts: BoardPostModel[];
}) {
  return <BoardPanel roomId={roomId} initialPosts={posts} />;
}
