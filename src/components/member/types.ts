import type { MemberStatus, PostCategory } from "@/lib/domain";
import type { MemberLinks } from "@/lib/store";

export type MemberCardModel = {
  username: string;
  displayName: string;
  country: string;
  campus: string | null;
  campusLabel: string | null;
  status: MemberStatus;
  arrivalYear: number | null;
  program: string;
  avatarHue: number;
  links: MemberLinks | null;
};

export type BoardAuthor = {
  username: string;
  displayName: string;
  country: string;
  avatarHue: number;
};

export type BoardPostModel = {
  id: string;
  category: PostCategory;
  title: string;
  body: string;
  createdAt: number;
  replyCount: number;
  author: BoardAuthor;
};

export type BoardReplyModel = {
  id: string;
  body: string;
  createdAt: number;
  author: BoardAuthor;
};

export type CityOption = { slug: string; name: string };

export type CampusFilterOption = {
  slug: string;
  label: string;
  city: string;
  citySlug: string;
};

export function hasVisibleLinks(links: MemberLinks | null): boolean {
  if (!links) return false;
  return Boolean(links.wechat || links.instagram || links.email);
}
