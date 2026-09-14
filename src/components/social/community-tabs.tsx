"use client";

import { MessageCircle, MessageSquare, Users } from "lucide-react";
import type { BoardPostModel, ChatMessageModel, MemberCardModel } from "@/components/member/types";
import { BoardPanel } from "@/components/social/board-panel";
import { ChatRoom } from "@/components/social/chat-room";
import { PeoplePanel } from "@/components/social/people-panel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { RoomPulse } from "@/lib/store";

export function CommunityTabs({
  roomId,
  roomLabel,
  kind,
  posts,
  messages,
  members,
  signedIn,
  pulse,
}: {
  roomId: string;
  roomLabel: string;
  kind: "city" | "campus";
  posts: BoardPostModel[];
  messages: ChatMessageModel[];
  members: MemberCardModel[];
  signedIn: boolean;
  pulse: RoomPulse;
}) {
  return (
    <Tabs defaultValue="board" className="gap-4">
      <TabsList className="grid h-auto w-full grid-cols-3 p-1">
        <TabsTrigger value="board" className="min-h-9 flex-col gap-0.5 py-1.5 text-[13px] sm:flex-row sm:text-sm">
          <MessageSquare />
          留言板
        </TabsTrigger>
        <TabsTrigger value="chat" className="min-h-9 flex-col gap-0.5 py-1.5 text-[13px] sm:flex-row sm:text-sm">
          <MessageCircle />
          聊天室
        </TabsTrigger>
        <TabsTrigger value="people" className="min-h-9 flex-col gap-0.5 py-1.5 text-[13px] sm:flex-row sm:text-sm">
          <Users />
          在这里的人
        </TabsTrigger>
      </TabsList>
      <TabsContent value="board">
        <BoardPanel roomId={roomId} initialPosts={posts} />
      </TabsContent>
      <TabsContent value="chat">
        <ChatRoom
          roomId={roomId}
          initialMessages={messages}
          signedIn={signedIn}
          pulse={pulse}
        />
      </TabsContent>
      <TabsContent value="people">
        <PeoplePanel members={members} roomLabel={roomLabel} kind={kind} />
      </TabsContent>
    </Tabs>
  );
}
