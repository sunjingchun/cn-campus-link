"use client";

import { AtSign, Mail, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import type { MemberLinks } from "@/lib/store";

export function ContactLinks({ links }: { links: MemberLinks }) {
  const items = [
    links.wechat
      ? {
          key: "wechat",
          icon: MessageCircle,
          label: links.wechat,
          hint: "微信",
          href: null as string | null,
        }
      : null,
    links.instagram
      ? {
          key: "instagram",
          icon: AtSign,
          label: links.instagram,
          hint: "Instagram",
          href: `https://instagram.com/${links.instagram.replace(/^@/, "")}`,
        }
      : null,
    links.email
      ? {
          key: "email",
          icon: Mail,
          label: links.email,
          hint: "邮箱",
          href: `mailto:${links.email}`,
        }
      : null,
  ].filter((item): item is NonNullable<typeof item> => item !== null);

  if (items.length === 0) return null;

  return (
    <ul className="flex flex-wrap gap-1.5">
      {items.map((item) => {
        const Icon = item.icon;
        const className =
          "inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground transition hover:bg-primary/10 hover:text-primary";
        if (item.href) {
          return (
            <li key={item.key}>
              <a
                href={item.href}
                target={item.href.startsWith("http") ? "_blank" : undefined}
                rel={item.href.startsWith("http") ? "noreferrer" : undefined}
                className={className}
              >
                <Icon className="size-3" />
                {item.label}
              </a>
            </li>
          );
        }
        return (
          <li key={item.key}>
            <button
              type="button"
              className={className}
              onClick={() => {
                void navigator.clipboard.writeText(item.label).then(
                  () => toast.success(`已复制${item.hint}`),
                  () => toast.error("复制失败，请手动抄一下"),
                );
              }}
            >
              <Icon className="size-3" />
              {item.label}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
