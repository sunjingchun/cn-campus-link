"use client";

import { Users } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { JoinButton } from "@/components/member/auth-cta";
import { MemberCard } from "@/components/member/member-card";
import type { MemberCardModel } from "@/components/member/types";
import { EmptyState } from "@/components/social/empty-state";

export function PeoplePanel({
  members,
  roomLabel,
  kind,
}: {
  members: MemberCardModel[];
  roomLabel: string;
  kind: "city" | "campus";
}) {
  const { member } = useAuth();
  if (members.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="还没有人报到这里"
        description={
          kind === "campus"
            ? `${roomLabel} 的成员墙还是空的。填一次资料，你就会出现在后来者打开的第一屏。`
            : `${roomLabel} 各校区还没有人报到。先占一个位置，后来的人就知道这里有伴。`
        }
        action={
          member ? undefined : (
            <JoinButton reason="报到之后，你会出现在这面墙上">成为第一个</JoinButton>
          )
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {members.length} 人在 {roomLabel}
      </p>
      <ul className="grid gap-3 sm:grid-cols-2">
        {members.map((member) => (
          <li key={member.username}>
            <MemberCard member={member} />
          </li>
        ))}
      </ul>
    </div>
  );
}
