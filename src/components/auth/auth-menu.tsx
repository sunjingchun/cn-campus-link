"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth/auth-provider";
import { MemberAvatar } from "@/components/shared/member-avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AuthMenu() {
  const { member, open, signOut } = useAuth();

  if (!member) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => open("signin")}>
          登录
        </Button>
        <Button size="sm" onClick={() => open("signup")}>
          加入
        </Button>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="rounded-full outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-ring">
        <MemberAvatar name={member.displayName} hue={member.avatarHue} country={member.country} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="space-y-0.5">
          <span className="block truncate">{member.displayName}</span>
          <span className="block truncate text-xs font-normal text-muted-foreground">
            @{member.username}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href={`/u/${member.username}`} />}>
          我的主页
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/settings" />}>编辑资料</DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/members" />}>成员目录</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => void signOut()}>退出登录</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
