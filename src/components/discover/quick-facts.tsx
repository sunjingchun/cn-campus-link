import {
  BedDouble,
  CalendarDays,
  Check,
  ExternalLink,
  GraduationCap,
  Home,
  Languages,
  School,
  Users,
  Wallet,
  X,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { cny, usd, type CampusFacts } from "@/lib/domain";
import { cn } from "@/lib/utils";

const LANGUAGE_LABEL: Readonly<Record<CampusFacts["teachingLanguages"][number], string>> = {
  zh: "中文",
  en: "English",
};

function YesNo({ value, yes, no }: { value: boolean; yes: string; no: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1", value ? "text-jade" : "text-primary")}>
      {value ? <Check className="size-4" aria-hidden /> : <X className="size-4" aria-hidden />}
      {value ? yes : no}
    </span>
  );
}

export function QuickFacts({ facts, className }: { facts: CampusFacts; className?: string }) {
  const [tuitionLow, tuitionHigh] = facts.tuitionCnyPerYear;
  return (
    <dl className={cn("grid grid-cols-2 gap-px overflow-hidden rounded-2xl border bg-border md:grid-cols-4", className)}>
      <Fact icon={Users} label="国际生" en="Intl. students">
        {facts.internationalStudents.toLocaleString("zh-CN")}
        <small className="ml-1 text-xs font-normal text-muted-foreground">来自 {facts.countries} 个国家</small>
      </Fact>
      <Fact icon={Wallet} label="学费 / 年" en="Tuition">
        {cny(tuitionLow)} – {cny(tuitionHigh)}
        <small className="block text-xs font-normal text-muted-foreground">
          {usd(tuitionLow)} – {usd(tuitionHigh)}
        </small>
      </Fact>
      <Fact icon={Languages} label="授课语言" en="Taught in">
        {facts.teachingLanguages.map((language) => LANGUAGE_LABEL[language]).join(" / ")}
      </Fact>
      <Fact icon={School} label="始建" en="Founded">
        {facts.foundedYear}
      </Fact>
      <Fact icon={BedDouble} label="宿舍" en="Dorm">
        <YesNo value={facts.dormGuaranteed} yes="保证有床位" no="不保证床位" />
      </Fact>
      <Fact icon={Home} label="校外住宿" en="Off campus">
        <YesNo value={facts.offCampusAllowed} yes="允许" no="不允许" />
      </Fact>
      <Fact icon={CalendarDays} label="申请窗口" en="Applications" className="col-span-2" small>
        {facts.applicationWindow}
      </Fact>
      <Fact icon={GraduationCap} label="奖学金" en="Scholarships" className="col-span-2 md:col-span-3" small>
        {facts.scholarshipNote}
      </Fact>
      <Fact icon={ExternalLink} label="官网" en="Website" className="col-span-2 md:col-span-1" small>
        <a
          href={facts.website}
          target="_blank"
          rel="noreferrer"
          className="break-all text-primary underline-offset-4 hover:underline"
        >
          {facts.website.replace(/^https?:\/\//, "")}
        </a>
      </Fact>
    </dl>
  );
}

function Fact({
  icon: Icon,
  label,
  en,
  small,
  className,
  children,
}: {
  icon: LucideIcon;
  label: string;
  en: string;
  small?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("bg-card px-4 py-3.5", className)}>
      <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="size-3.5" aria-hidden />
        {label}
        <span className="text-[11px] opacity-70">{en}</span>
      </dt>
      <dd className={cn("mt-1 tabular-nums tracking-tight", small ? "text-sm leading-relaxed" : "text-lg font-semibold")}>
        {children}
      </dd>
    </div>
  );
}
