import { MessageSquare } from "lucide-react";
import Link from "next/link";
import { roomExists, roomTitle } from "@/data";
import { parseRoom, POST_CATEGORY_META, type Room } from "@/lib/domain";
import type { BoardPost } from "@/lib/store";

function roomHref(room: Room): string {
  return room.kind === "city" ? `/city/${room.city}#social` : `/campus/${room.campus}#social`;
}

function timeAgo(timestamp: number, now = Date.now()): string {
  const minutes = Math.max(0, Math.round((now - timestamp) / 60_000));
  if (minutes < 1) return "刚刚";
  if (minutes < 60) return `${minutes} 分钟前`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} 小时前`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} 天前`;
  return new Date(timestamp).toLocaleDateString("zh-CN", { month: "numeric", day: "numeric" });
}

export function RecentThreads({ posts }: { posts: BoardPost[] }) {
  const threads = posts.flatMap((post) => {
    const room = parseRoom(post.room);
    return room && roomExists(room) ? [{ post, room }] : [];
  });
  if (threads.length === 0) return null;

  return (
    <ul className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4">
      {threads.map(({ post, room }, index) => {
        const category = POST_CATEGORY_META[post.category];
        return (
          <li
            key={post.id}
            className="animate-rise-in w-[78vw] max-w-xs shrink-0 snap-start sm:w-auto sm:max-w-none"
            style={{ animationDelay: `${index * 40}ms` }}
          >
            <Link
              href={roomHref(room)}
              className="group flex h-full flex-col rounded-2xl border bg-card p-4 transition-all outline-none hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus-visible:ring-3 focus-visible:ring-ring/50 motion-reduce:transition-none"
            >
              <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-secondary-foreground">
                  <span aria-hidden>{category.emoji}</span>
                  {category.zh}
                </span>
                <span className="tabular-nums">{timeAgo(post.createdAt)}</span>
              </div>
              <p className="mt-2.5 line-clamp-2 font-medium leading-snug tracking-tight group-hover:text-primary">
                {post.title}
              </p>
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{post.body}</p>
              <div className="mt-auto flex items-center justify-between gap-2 pt-3 text-xs text-muted-foreground">
                <span className="truncate">
                  {post.author.displayName} · {roomTitle(room)}
                </span>
                <span className="inline-flex shrink-0 items-center gap-1 tabular-nums">
                  <MessageSquare className="size-3.5" />
                  {post.replyCount}
                </span>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
