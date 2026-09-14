"use client";

import Link from "next/link";
import { MessageSquare, MessageSquarePlus, Send } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import type { BoardAuthor, BoardPostModel, BoardReplyModel } from "@/components/member/types";
import { MemberAvatar } from "@/components/shared/member-avatar";
import { readApiError } from "@/components/social/api-error";
import { EmptyState } from "@/components/social/empty-state";
import { relativeTime } from "@/components/social/relative-time";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { POST_CATEGORIES, POST_CATEGORY_META, type PostCategory } from "@/lib/domain";
import { cn } from "@/lib/utils";

function preview(text: string, max = 96): string {
  const trimmed = text.replace(/\s+/g, " ").trim();
  return trimmed.length > max ? `${trimmed.slice(0, max)}…` : trimmed;
}

function asAuthor(member: {
  username: string;
  displayName: string;
  country: string;
  avatarHue: number;
}): BoardAuthor {
  return {
    username: member.username,
    displayName: member.displayName,
    country: member.country,
    avatarHue: member.avatarHue,
  };
}

export function BoardPanel({
  roomId,
  initialPosts,
}: {
  roomId: string;
  initialPosts: BoardPostModel[];
}) {
  const [posts, setPosts] = useState(initialPosts);

  return (
    <div className="space-y-4">
      <PostComposer
        roomId={roomId}
        onCreated={(post) => setPosts((current) => [post, ...current])}
      />
      {posts.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="还没有人留言"
          description="把你刚踩过的坑写下来，下一个到这个校区的人会谢谢你。上面就能发第一条。"
        />
      ) : (
        <ul className="space-y-3">
          {posts.map((post) => (
            <li key={post.id}>
              <ThreadCard
                post={post}
                onReplied={() =>
                  setPosts((current) =>
                    current.map((item) =>
                      item.id === post.id ? { ...item, replyCount: item.replyCount + 1 } : item,
                    ),
                  )
                }
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function PostComposer({
  roomId,
  onCreated,
}: {
  roomId: string;
  onCreated: (post: BoardPostModel) => void;
}) {
  const { member, requireMember } = useAuth();
  const [category, setCategory] = useState<PostCategory>("question");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!requireMember("登录后才能发帖")) return;
    setPending(true);
    setError(null);
    const response = await fetch("/api/posts", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ room: roomId, category, title, body }),
    });
    if (!response.ok) {
      setError(await readApiError(response));
      setPending(false);
      return;
    }
    const data = (await response.json()) as { id: string };
    if (member) {
      onCreated({
        id: data.id,
        category,
        title: title.trim(),
        body: body.trim(),
        createdAt: Date.now(),
        replyCount: 0,
        author: asAuthor(member),
      });
    }
    setTitle("");
    setBody("");
    setPending(false);
  }

  return (
    <form
      className="rounded-2xl bg-card p-4 ring-1 ring-foreground/8 sm:p-5"
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
    >
      <p className="mb-3 text-sm font-medium tracking-tight">发帖</p>
      <div className="mb-3 flex gap-1.5 overflow-x-auto no-scrollbar">
        {POST_CATEGORIES.map((option) => {
          const meta = POST_CATEGORY_META[option];
          return (
            <button
              key={option}
              type="button"
              onClick={() => setCategory(option)}
              className={cn(
                "shrink-0 rounded-full border px-2.5 py-1 text-xs transition",
                category === option
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border text-muted-foreground hover:border-primary/40",
              )}
            >
              {meta.emoji} {meta.zh}
            </button>
          );
        })}
      </div>
      <div className="space-y-2">
        <Input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="标题，比如：仙林办银行卡要带什么"
          maxLength={90}
        />
        <Textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder="把经过写清楚，后来的人就能少走一步。"
          maxLength={4000}
          className="min-h-24"
        />
      </div>
      {error ? <p className="mt-2 text-sm text-destructive">{error}</p> : null}
      <div className="mt-3 flex justify-end">
        <Button type="submit" disabled={pending || title.trim().length < 2 || body.trim().length < 2}>
          <MessageSquarePlus />
          {pending ? "正在发布…" : "发布"}
        </Button>
      </div>
    </form>
  );
}

function ThreadCard({
  post,
  onReplied,
}: {
  post: BoardPostModel;
  onReplied: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [replies, setReplies] = useState<BoardReplyModel[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const category = POST_CATEGORY_META[post.category];

  async function toggle() {
    const next = !open;
    setOpen(next);
    if (!next || replies !== null) return;
    setLoading(true);
    setError(null);
    const response = await fetch(`/api/posts/${post.id}/replies`);
    if (!response.ok) {
      setError(await readApiError(response));
      setLoading(false);
      return;
    }
    const data = (await response.json()) as { replies: BoardReplyModel[] };
    setReplies(data.replies);
    setLoading(false);
  }

  return (
    <article className="rounded-2xl bg-card ring-1 ring-foreground/8">
      <button type="button" onClick={() => void toggle()} className="w-full px-4 py-4 text-left sm:px-5">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium">
            {category.emoji} {category.zh}
          </span>
          <span className="text-xs text-muted-foreground">{relativeTime(post.createdAt)}</span>
          <span className="text-xs text-muted-foreground">
            {post.replyCount} 条回复
          </span>
        </div>
        <h3 className="text-base font-medium tracking-tight">{post.title}</h3>
        <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
          {open ? post.body : preview(post.body)}
        </p>
        <div className="mt-3 flex items-center gap-2">
          <MemberAvatar
            name={post.author.displayName}
            hue={post.author.avatarHue}
            country={post.author.country}
            size="sm"
          />
          <span className="text-sm">{post.author.displayName}</span>
        </div>
      </button>
      {open ? (
        <div className="border-t border-border/70 px-4 py-4 sm:px-5">
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-5/6" />
            </div>
          ) : null}
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          {replies && replies.length === 0 ? (
            <p className="mb-3 text-sm text-muted-foreground">还没有回复，来写第一条。</p>
          ) : null}
          {replies && replies.length > 0 ? (
            <ul className="mb-4 space-y-3">
              {replies.map((reply) => (
                <li key={reply.id} className="flex gap-2.5">
                  <Link href={`/u/${reply.author.username}`} className="mt-0.5 shrink-0">
                    <MemberAvatar
                      name={reply.author.displayName}
                      hue={reply.author.avatarHue}
                      country={reply.author.country}
                      size="sm"
                    />
                  </Link>
                  <div className="min-w-0">
                    <p className="text-sm">
                      <Link href={`/u/${reply.author.username}`} className="font-medium hover:text-primary">
                        {reply.author.displayName}
                      </Link>
                      <span className="ml-2 text-xs text-muted-foreground">
                        {relativeTime(reply.createdAt)}
                      </span>
                    </p>
                    <p className="mt-0.5 text-sm leading-6">{reply.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : null}
          <ReplyComposer
            postId={post.id}
            onCreated={(reply) => {
              setReplies((current) => [...(current ?? []), reply]);
              onReplied();
            }}
          />
        </div>
      ) : null}
    </article>
  );
}

function ReplyComposer({
  postId,
  onCreated,
}: {
  postId: string;
  onCreated: (reply: BoardReplyModel) => void;
}) {
  const { member, requireMember } = useAuth();
  const [body, setBody] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!requireMember("登录后才能回复")) return;
    setPending(true);
    setError(null);
    const response = await fetch(`/api/posts/${postId}/replies`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ body }),
    });
    if (!response.ok) {
      setError(await readApiError(response));
      setPending(false);
      return;
    }
    const data = (await response.json()) as { id: string };
    if (member) {
      onCreated({
        id: data.id,
        body: body.trim(),
        createdAt: Date.now(),
        author: asAuthor(member),
      });
    }
    setBody("");
    setPending(false);
  }

  return (
    <form
      className="flex flex-col gap-2 sm:flex-row sm:items-end"
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
    >
      <div className="min-w-0 flex-1 space-y-1.5">
        <Textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder="写一条回复…"
          maxLength={2000}
          className="min-h-16"
        />
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>
      <Button type="submit" disabled={pending || body.trim().length === 0}>
        <Send />
        {pending ? "发送中…" : "回复"}
      </Button>
    </form>
  );
}
