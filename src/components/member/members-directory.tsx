"use client";

import { Search, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { MemberCard } from "@/components/member/member-card";
import type { CampusFilterOption, CityOption, MemberCardModel } from "@/components/member/types";
import { EmptyState } from "@/components/social/empty-state";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { COUNTRIES, flagOf } from "@/lib/countries";
import { MEMBER_STATUS_META, MEMBER_STATUSES } from "@/lib/domain";

export function MembersDirectory({
  members,
  cities,
  campuses,
  stats,
}: {
  members: MemberCardModel[];
  cities: CityOption[];
  campuses: CampusFilterOption[];
  stats: { members: number; countries: number };
}) {
  const [search, setSearch] = useState("");
  const [city, setCity] = useState<string | null>("all");
  const [campus, setCampus] = useState<string | null>("all");
  const [country, setCountry] = useState<string | null>("all");
  const [status, setStatus] = useState<string | null>("all");

  const countries = useMemo(() => {
    const codes = [...new Set(members.map((member) => member.country))].sort((a, b) =>
      (COUNTRIES[a]?.zh ?? a).localeCompare(COUNTRIES[b]?.zh ?? b, "zh-CN"),
    );
    return codes;
  }, [members]);

  const campusChoices = useMemo(
    () => (city && city !== "all" ? campuses.filter((option) => option.citySlug === city) : campuses),
    [campuses, city],
  );

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return members.filter((member) => {
      if (q) {
        const hay = `${member.displayName} ${member.username} ${member.program}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (country && country !== "all" && member.country !== country) return false;
      if (status && status !== "all" && member.status !== status) return false;
      if (campus && campus !== "all" && member.campus !== campus) return false;
      if (city && city !== "all") {
        const match = campuses.find((option) => option.slug === member.campus);
        if (!match || match.citySlug !== city) return false;
      }
      return true;
    });
  }, [campus, campuses, city, country, members, search, status]);

  return (
    <div className="space-y-6">
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        <label className="relative sm:col-span-2 lg:col-span-1">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="搜名字、专业…"
            className="pl-8"
          />
        </label>
        <Select
          value={city}
          onValueChange={(value) => {
            setCity(value);
            setCampus("all");
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="全部城市">
              {(value) =>
                !value || value === "all"
                  ? "全部城市"
                  : (cities.find((item) => item.slug === value)?.name ?? value)
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部城市</SelectItem>
            {cities.map((item) => (
              <SelectItem key={item.slug} value={item.slug}>
                {item.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={campus} onValueChange={setCampus}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="全部校区">
              {(value) =>
                !value || value === "all"
                  ? "全部校区"
                  : (campuses.find((item) => item.slug === value)?.label ?? value)
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="max-h-72">
            <SelectItem value="all">全部校区</SelectItem>
            {campusChoices.map((item) => (
              <SelectItem key={item.slug} value={item.slug}>
                {item.city} · {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={country} onValueChange={setCountry}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="全部国家">
              {(value) =>
                !value || value === "all"
                  ? "全部国家"
                  : `${flagOf(value)} ${COUNTRIES[value]?.zh ?? value}`
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="max-h-72">
            <SelectItem value="all">全部国家</SelectItem>
            {countries.map((code) => (
              <SelectItem key={code} value={code}>
                {flagOf(code)} {COUNTRIES[code]?.zh ?? code} · {COUNTRIES[code]?.en ?? code}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="全部状态">
              {(value) =>
                !value || value === "all" || !(value in MEMBER_STATUS_META)
                  ? "全部状态"
                  : MEMBER_STATUS_META[value as keyof typeof MEMBER_STATUS_META].zh
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部状态</SelectItem>
            {MEMBER_STATUSES.map((option) => (
              <SelectItem key={option} value={option}>
                {MEMBER_STATUS_META[option].zh} · {MEMBER_STATUS_META[option].en}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <p className="text-sm text-muted-foreground">
        一共 {stats.members} 位成员 · 来自 {stats.countries} 个国家
        {visible.length !== members.length ? ` · 当前显示 ${visible.length}` : null}
      </p>

      {visible.length === 0 ? (
        <EmptyState
          icon={Users}
          title="没有符合条件的人"
          description="换个城市、国家或者把搜索词缩短一点再试试。"
        />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((member) => (
            <li key={member.username}>
              <MemberCard member={member} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
