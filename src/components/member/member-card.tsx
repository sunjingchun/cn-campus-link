import Link from "next/link";
import { MemberAvatar } from "@/components/shared/member-avatar";
import { ContactLinks } from "@/components/member/contact-links";
import { hasVisibleLinks, type MemberCardModel } from "@/components/member/types";
import { countryZh, flagOf } from "@/lib/countries";
import { MEMBER_STATUS_META } from "@/lib/domain";
import { cn } from "@/lib/utils";

export function StatusBadge({ status }: { status: MemberCardModel["status"] }) {
  const meta = MEMBER_STATUS_META[status];
  return (
    <span className={cn("inline-flex h-5 items-center rounded-full px-2 text-[11px] font-medium", meta.tone)}>
      {meta.zh}
    </span>
  );
}

export function MemberCard({
  member,
  className,
}: {
  member: MemberCardModel;
  className?: string;
}) {
  const meta = [
    member.campusLabel,
    member.program || null,
    member.arrivalYear ? `${member.arrivalYear} 年入学` : null,
  ].filter(Boolean);

  return (
    <article
      className={cn(
        "flex h-full flex-col gap-3 rounded-2xl bg-card p-4 ring-1 ring-foreground/8 transition hover:ring-primary/25",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <Link href={`/u/${member.username}`} className="shrink-0">
          <MemberAvatar
            name={member.displayName}
            hue={member.avatarHue}
            country={member.country}
          />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <Link
              href={`/u/${member.username}`}
              className="truncate font-medium tracking-tight hover:text-primary"
            >
              {member.displayName}
            </Link>
            <StatusBadge status={member.status} />
          </div>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {flagOf(member.country)} {countryZh(member.country)}
            <span className="mx-1 text-border">·</span>@{member.username}
          </p>
        </div>
      </div>
      {meta.length > 0 ? (
        <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">{meta.join(" · ")}</p>
      ) : null}
      {hasVisibleLinks(member.links) && member.links ? <ContactLinks links={member.links} /> : null}
    </article>
  );
}
