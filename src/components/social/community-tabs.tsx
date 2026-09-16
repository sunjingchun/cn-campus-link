"use client";

import { MessageSquare, Users } from "lucide-react";
import type { BoardPostModel, MemberCardModel } from "@/components/member/types";
import { BoardPanel } from "@/components/social/board-panel";
import { PeoplePanel } from "@/components/social/people-panel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function CommunityTabs({
  roomId,
  roomLabel,
  kind,
  posts,
  members,
}: {
  roomId: string;
  roomLabel: string;
  kind: "city" | "campus";
  posts: BoardPostModel[];
  members: MemberCardModel[];
}) {
  return (
    <Tabs defaultValue="board" className="gap-4">
      <TabsList className="grid h-auto w-full grid-cols-2 p-1">
        <TabsTrigger value="board" className="min-h-9 flex-col gap-0.5 py-1.5 text-[13px] sm:flex-row sm:text-sm">
          <MessageSquare />
          留言板
        </TabsTrigger>
        <TabsTrigger value="people" className="min-h-9 flex-col gap-0.5 py-1.5 text-[13px] sm:flex-row sm:text-sm">
          <Users />
          在这里的人
        </TabsTrigger>
      </TabsList>
      <TabsContent value="board">
        <BoardPanel roomId={roomId} initialPosts={posts} />
      </TabsContent>
      <TabsContent value="people">
        <PeoplePanel members={members} roomLabel={roomLabel} kind={kind} />
      </TabsContent>
    </Tabs>
  );
}
