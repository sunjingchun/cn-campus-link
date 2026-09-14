"use client";

import Link from "next/link";
import { Lock, MessageCircle, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import type { ChatMessageModel } from "@/components/member/types";
import { MemberAvatar } from "@/components/shared/member-avatar";
import { readApiError } from "@/components/social/api-error";
import { EmptyState } from "@/components/social/empty-state";
import { relativeTime } from "@/components/social/relative-time";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { RoomPulse } from "@/lib/store";
import { cn } from "@/lib/utils";

/** Redaction bars, not invented sentences. Nothing here claims to be a message. */
const BAR_WIDTHS = ["58%", "34%", "72%", "46%", "64%", "40%"];

export function ChatRoom({
  roomId,
  initialMessages,
  signedIn,
  pulse,
}: {
  roomId: string;
  initialMessages: ChatMessageModel[];
  signedIn: boolean;
  pulse: RoomPulse;
}) {
  if (!signedIn) return <ChatGate pulse={pulse} />;
  return <LiveChat roomId={roomId} initialMessages={initialMessages} />;
}

function ChatGate({ pulse }: { pulse: RoomPulse }) {
  const { open } = useAuth();
  const rows = pulse.voices.length > 0 ? pulse.voices : null;

  return (
    <div className="relative min-h-[380px] overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/8">
      <div className="pointer-events-none select-none space-y-3 p-4" aria-hidden>
        {(rows ?? BAR_WIDTHS.slice(0, 4).map(() => null)).map((voice, index) => (
          <div key={index} className="flex gap-2.5">
            {voice ? (
              <MemberAvatar
                name={voice.displayName}
                hue={voice.avatarHue}
                country={voice.country}
                size="sm"
              />
            ) : (
              <span className="h-8 w-8 shrink-0 rounded-full bg-secondary" />
            )}
            <div className="min-w-0 flex-1 space-y-1.5 rounded-2xl bg-secondary px-3 py-2.5">
              <span className="block h-2 w-16 rounded-full bg-foreground/15" />
              <span
                className="block h-2.5 rounded-full bg-foreground/10"
                style={{ width: BAR_WIDTHS[index % BAR_WIDTHS.length] }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="absolute inset-0 grid place-items-center bg-background/55 px-4 backdrop-blur-[2px]">
        <Card className="w-full max-w-sm py-6">
          <CardHeader className="items-center text-center">
            <div className="mx-auto mb-1 grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 text-primary">
              <Lock className="size-5" />
            </div>
            <CardTitle>聊天室只对成员开放</CardTitle>
            <CardDescription>
              {pulse.messages > 0
                ? `这个房间已经有 ${pulse.messages} 条消息，${pulse.voices.length} 个人在聊。加入后就能看到，也能自己打一句。`
                : "这个房间还没有人说话。加入后你可以是第一个。"}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button size="lg" onClick={() => open("signup", "聊天室只对成员开放")}>
              加入
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function LiveChat({
  roomId,
  initialMessages,
}: {
  roomId: string;
  initialMessages: ChatMessageModel[];
}) {
  const { member, requireMember } = useAuth();
  const [messages, setMessages] = useState(initialMessages);
  const [body, setBody] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [live, setLive] = useState(true);
  const afterRef = useRef(maxSeq(initialMessages));
  const scrollerRef = useRef<HTMLDivElement>(null);
  const pinnedRef = useRef(true);

  useEffect(() => {
    let alive = true;
    let inFlight = false;

    async function tick() {
      if (inFlight) return;
      inFlight = true;
      try {
        const response = await fetch(
          `/api/messages?room=${encodeURIComponent(roomId)}&after=${afterRef.current}`,
        );
        if (!alive) return;
        if (!response.ok) {
          setLive(false);
          return;
        }
        setLive(true);
        const data = (await response.json()) as { messages?: ChatMessageModel[] };
        const incoming = data.messages ?? [];
        if (incoming.length === 0) return;
        setMessages((current) => {
          const seen = new Set(current.map((item) => item.seq));
          const fresh = incoming.filter((item) => !seen.has(item.seq));
          if (fresh.length === 0) return current;
          afterRef.current = Math.max(afterRef.current, ...fresh.map((item) => item.seq));
          return [...current, ...fresh];
        });
      } catch {
        if (alive) setLive(false);
      } finally {
        inFlight = false;
      }
    }

    const id = window.setInterval(() => {
      void tick();
    }, 3000);
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, [roomId]);

  useEffect(() => {
    const node = scrollerRef.current;
    if (node && pinnedRef.current) node.scrollTop = node.scrollHeight;
  }, [messages]);

  async function send() {
    if (!requireMember("登录后才能发言")) return;
    const text = body.trim();
    if (!text) return;
    setPending(true);
    setError(null);
    const response = await fetch("/api/messages", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ room: roomId, body: text }),
    });
    if (!response.ok) {
      setError(await readApiError(response));
      setPending(false);
      return;
    }
    const data = (await response.json()) as { seq: number };
    if (member) {
      setMessages((current) => {
        if (current.some((item) => item.seq === data.seq)) return current;
        afterRef.current = Math.max(afterRef.current, data.seq);
        return [
          ...current,
          {
            id: `local-${data.seq}`,
            seq: data.seq,
            body: text,
            createdAt: Date.now(),
            author: {
              username: member.username,
              displayName: member.displayName,
              country: member.country,
              avatarHue: member.avatarHue,
            },
          },
        ];
      });
    }
    setBody("");
    setPending(false);
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/8">
      <div className="flex items-center justify-between gap-3 border-b border-border/70 px-4 py-3">
        <div className="flex items-center gap-2 text-sm">
          <span className="relative flex h-2 w-2">
            <span className="absolute inset-0 rounded-full bg-jade animate-live-pulse" />
            <span className="relative h-2 w-2 rounded-full bg-jade" />
          </span>
          <span className="font-medium">{live ? "实时" : "重连中"}</span>
          <span className="text-muted-foreground">Live · 每 3 秒刷新</span>
        </div>
      </div>
      <div
        ref={scrollerRef}
        className="h-[min(28rem,60vh)] overflow-y-auto px-4 py-4"
        onScroll={(event) => {
          const node = event.currentTarget;
          pinnedRef.current = node.scrollHeight - node.scrollTop - node.clientHeight < 56;
        }}
      >
        {messages.length === 0 ? (
          <EmptyState
            icon={MessageCircle}
            title="房间还是安静的"
            description="打个招呼吧。第一句话会出现在这里，后来的人一进来就能看到。"
          />
        ) : (
          <ul className="space-y-1">
            {messages.map((message, index) => {
              const previous = messages[index - 1];
              const grouped = previous?.author.username === message.author.username;
              return (
                <li key={message.seq} className={cn("flex gap-2.5", grouped ? "pt-0.5" : "pt-3")}>
                  <div className="w-8 shrink-0">
                    {grouped ? null : (
                      <Link href={`/u/${message.author.username}`}>
                        <MemberAvatar
                          name={message.author.displayName}
                          hue={message.author.avatarHue}
                          country={message.author.country}
                          size="sm"
                        />
                      </Link>
                    )}
                  </div>
                  <div className="min-w-0">
                    {grouped ? null : (
                      <p className="mb-0.5 text-sm">
                        <Link
                          href={`/u/${message.author.username}`}
                          className="font-medium hover:text-primary"
                        >
                          {message.author.displayName}
                        </Link>
                        <span className="ml-2 text-xs text-muted-foreground">
                          {relativeTime(message.createdAt)}
                        </span>
                      </p>
                    )}
                    <p className="text-sm leading-6">{message.body}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <form
        className="flex items-end gap-2 border-t border-border/70 px-3 py-3"
        onSubmit={(event) => {
          event.preventDefault();
          void send();
        }}
      >
        <div className="min-w-0 flex-1 space-y-1.5">
          <Input
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder="说一句，按回车发送"
            maxLength={600}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void send();
              }
            }}
          />
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>
        <Button type="submit" disabled={pending || body.trim().length === 0}>
          <Send />
          {pending ? "发送中…" : "发送"}
        </Button>
      </form>
    </div>
  );
}

function maxSeq(messages: ChatMessageModel[]): number {
  return messages.reduce((highest, message) => Math.max(highest, message.seq), 0);
}
