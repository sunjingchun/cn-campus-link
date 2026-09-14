"use client";

import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/auth-provider";
import { JoinButton, SignInButton } from "@/components/member/auth-cta";
import { MemberCard } from "@/components/member/member-card";
import { TagInput } from "@/components/member/tag-input";
import type { MemberCardModel } from "@/components/member/types";
import { readApiError } from "@/components/social/api-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { CampusOption } from "@/data";
import { COUNTRIES, COUNTRY_CODES, flagOf } from "@/lib/countries";
import {
  DEGREE_LEVEL_META,
  DEGREE_LEVELS,
  MEMBER_STATUS_META,
  MEMBER_STATUSES,
  type DegreeLevel,
  type MemberStatus,
} from "@/lib/domain";
import type { Member } from "@/lib/store";
import { cn } from "@/lib/utils";

export function ProfileEditor({
  member,
  campuses,
}: {
  member: Member | null;
  campuses: CampusOption[];
}) {
  const { open } = useAuth();
  if (!member) {
    return (
      <div className="mx-auto max-w-md rounded-2xl bg-card px-6 py-12 text-center ring-1 ring-foreground/8">
        <h1 className="text-2xl font-semibold tracking-tight">先登录，再填资料</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Members fill in their own information. 登录之后，你写的专业、到校年份和联系方式会出现在校区墙上。
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <SignInButton reason="编辑资料需要先登录" />
          <JoinButton reason="注册后就能填写你的主页">加入</JoinButton>
        </div>
        <button
          type="button"
          className="mt-4 text-sm text-primary hover:underline"
          onClick={() => open("signin", "编辑资料需要先登录")}
        >
          已经有账号了？
        </button>
      </div>
    );
  }

  return <ProfileForm key={member.id} member={member} campuses={campuses} />;
}

function ProfileForm({ member, campuses }: { member: Member; campuses: CampusOption[] }) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(member.displayName);
  const [country, setCountry] = useState<string | null>(member.country);
  const [campus, setCampus] = useState<string | null>(member.campus ?? "none");
  const [status, setStatus] = useState<MemberStatus>(member.status);
  const [arrivalYear, setArrivalYear] = useState(member.arrivalYear?.toString() ?? "");
  const [program, setProgram] = useState(member.program);
  const [level, setLevel] = useState<string | null>(member.level ?? "none");
  const [languages, setLanguages] = useState(member.languages);
  const [interests, setInterests] = useState(member.interests);
  const [bio, setBio] = useState(member.bio);
  const [wechat, setWechat] = useState(member.links?.wechat ?? "");
  const [instagram, setInstagram] = useState(member.links?.instagram ?? "");
  const [email, setEmail] = useState(member.links?.email ?? "");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const campusSlug = campus && campus !== "none" ? campus : null;
  const campusMeta = campuses.find((option) => option.slug === campusSlug);
  const preview: MemberCardModel = {
    username: member.username,
    displayName: displayName || member.displayName,
    country: country ?? member.country,
    campus: campusSlug,
    campusLabel: campusMeta ? `${campusMeta.city} · ${campusMeta.label}` : null,
    status,
    arrivalYear: arrivalYear ? Number(arrivalYear) : null,
    program,
    avatarHue: member.avatarHue,
    links: {
      wechat: wechat.trim() || null,
      instagram: instagram.trim() || null,
      email: email.trim() || null,
    },
  };

  async function submit() {
    setPending(true);
    setError(null);
    const year = arrivalYear.trim();
    const response = await fetch("/api/profile", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        displayName,
        country,
        campus: campusSlug ?? "",
        status,
        arrivalYear: year ? Number(year) : null,
        program,
        level: level && level !== "none" ? (level as DegreeLevel) : null,
        languages,
        interests,
        bio,
        links: {
          wechat,
          instagram,
          email,
        },
      }),
    });
    if (!response.ok) {
      setError(await readApiError(response));
      setPending(false);
      return;
    }
    toast.success("资料已更新，校区墙上会跟着变");
    router.refresh();
    setPending(false);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <form
        className="space-y-5 rounded-2xl bg-card p-5 ring-1 ring-foreground/8 sm:p-6"
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
      >
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">编辑资料</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            你填的信息会出现在 /u/{member.username} 和所在校区的成员墙上。
          </p>
        </div>

        <Field label="你想让大家怎么称呼你" hint="Display name">
          <Input value={displayName} onChange={(event) => setDisplayName(event.target.value)} maxLength={40} />
        </Field>

        <Field label="你来自哪里" hint="Country">
          <Select value={country} onValueChange={setCountry}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="选择国家">
                {(value) => (value ? `${flagOf(value)} ${COUNTRIES[value]?.zh ?? value}` : null)}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="max-h-72">
              {COUNTRY_CODES.map((code) => (
                <SelectItem key={code} value={code}>
                  {flagOf(code)} {COUNTRIES[code].zh} · {COUNTRIES[code].en}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="哪个校区" hint="还没定就先跳过">
          <Select value={campus} onValueChange={setCampus}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="选择校区">
                {(value) =>
                  value === "none" || !value
                    ? "还没决定"
                    : (campuses.find((option) => option.slug === value)?.label ?? value)
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="max-h-72">
              <SelectItem value="none">还没决定</SelectItem>
              {campuses.map((option) => (
                <SelectItem key={option.slug} value={option.slug}>
                  {option.city} · {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="你现在的状态" hint="Status">
          <div className="grid grid-cols-2 gap-2">
            {MEMBER_STATUSES.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setStatus(option)}
                className={cn(
                  "rounded-lg border px-3 py-2 text-left text-sm transition",
                  status === option
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border text-muted-foreground hover:border-primary/40",
                )}
              >
                <span className="block font-medium">{MEMBER_STATUS_META[option].zh}</span>
                <span className="block text-xs opacity-70">{MEMBER_STATUS_META[option].en}</span>
              </button>
            ))}
          </div>
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="入学年份" hint="Arrival year">
            <Input
              type="number"
              min={2000}
              max={2100}
              value={arrivalYear}
              onChange={(event) => setArrivalYear(event.target.value)}
              placeholder="2024"
            />
          </Field>
          <Field label="学位层次" hint="Degree">
            <Select value={level} onValueChange={setLevel}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="选择层次">
                  {(value) =>
                    value === "none" || !value
                      ? "先不填"
                      : DEGREE_LEVEL_META[value as DegreeLevel].zh
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">先不填</SelectItem>
                {DEGREE_LEVELS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {DEGREE_LEVEL_META[option].zh} · {DEGREE_LEVEL_META[option].en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>

        <Field label="专业 / 项目" hint="Programme">
          <Input
            value={program}
            onChange={(event) => setProgram(event.target.value)}
            maxLength={80}
            placeholder="国际经济与贸易"
          />
        </Field>

        <Field label="会说的语言" hint="Languages">
          <TagInput
            value={languages}
            onChange={setLanguages}
            max={8}
            placeholder="回车添加，比如 中文 HSK5"
          />
        </Field>

        <Field label="兴趣" hint="Interests">
          <TagInput
            value={interests}
            onChange={setInterests}
            max={10}
            placeholder="回车添加，比如 羽毛球"
          />
        </Field>

        <Field label="自我介绍" hint="Bio">
          <Textarea
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            maxLength={600}
            className="min-h-32"
            placeholder="你愿意被怎样记住？刚来时踩过的坑也欢迎写。"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="微信">
            <Input value={wechat} onChange={(event) => setWechat(event.target.value)} maxLength={40} />
          </Field>
          <Field label="Instagram">
            <Input
              value={instagram}
              onChange={(event) => setInstagram(event.target.value)}
              maxLength={40}
            />
          </Field>
          <Field label="联系邮箱">
            <Input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              maxLength={80}
            />
          </Field>
        </div>

        {error ? <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p> : null}

        <Button type="submit" size="lg" disabled={pending || !displayName.trim() || !country}>
          {pending ? "正在保存…" : "保存资料"}
        </Button>
      </form>

      <aside className="space-y-3 lg:sticky lg:top-24 lg:self-start">
        <p className="text-xs font-medium tracking-[0.16em] text-muted-foreground">预览 PREVIEW</p>
        <MemberCard member={preview} />
        <p className="text-xs leading-5 text-muted-foreground">
          这就是别人在成员目录和校区墙上看到的卡片。联系方式只对已登录的成员显示。
        </p>
      </aside>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="flex items-baseline gap-2 text-sm">
        {label}
        {hint ? <span className="text-xs font-normal text-muted-foreground">{hint}</span> : null}
      </Label>
      {children}
    </div>
  );
}
