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
import { copy, fill } from "@/lib/copy";
import { cny, usd, type CampusFacts } from "@/lib/domain";
import { localeNumber, t, type Locale } from "@/lib/locale";
import { cn } from "@/lib/utils";

function YesNo({ value, yes, no }: { value: boolean; yes: string; no: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1", value ? "text-jade" : "text-primary")}>
      {value ? <Check className="size-4" aria-hidden /> : <X className="size-4" aria-hidden />}
      {value ? yes : no}
    </span>
  );
}

export function QuickFacts({
  facts,
  locale,
  className,
}: {
  facts: CampusFacts;
  locale: Locale;
  className?: string;
}) {
  const [tuitionLow, tuitionHigh] = facts.tuitionCnyPerYear;
  return (
    <dl className={cn("grid grid-cols-2 gap-px overflow-hidden rounded-2xl border bg-border md:grid-cols-4", className)}>
      <Fact icon={Users} label={t(copy.intlStudents, locale)}>
        {facts.internationalStudents.toLocaleString(localeNumber(locale))}
        <small className="ml-1 text-xs font-normal text-muted-foreground">
          {fill(copy.intlFrom, locale, { n: facts.countries })}
        </small>
      </Fact>
      <Fact icon={Wallet} label={t(copy.tuitionYear, locale)}>
        {cny(tuitionLow)} – {cny(tuitionHigh)}
        <small className="block text-xs font-normal text-muted-foreground">
          {usd(tuitionLow)} – {usd(tuitionHigh)}
        </small>
      </Fact>
      <Fact icon={Languages} label={t(copy.taughtIn, locale)}>
        {facts.teachingLanguages.map((language) => (language === "zh" ? t(copy.langZh, locale) : "English")).join(" / ")}
      </Fact>
      <Fact icon={School} label={t(copy.founded, locale)}>
        {facts.foundedYear}
      </Fact>
      <Fact icon={BedDouble} label={t(copy.dorm, locale)}>
        <YesNo value={facts.dormGuaranteed} yes={t(copy.dormYes, locale)} no={t(copy.dormNo, locale)} />
      </Fact>
      <Fact icon={Home} label={t(copy.offCampus, locale)}>
        <YesNo value={facts.offCampusAllowed} yes={t(copy.allowed, locale)} no={t(copy.notAllowed, locale)} />
      </Fact>
      <Fact icon={CalendarDays} label={t(copy.applyWindow, locale)} className="col-span-2" small>
        {t(facts.applicationWindow, locale)}
      </Fact>
      <Fact icon={GraduationCap} label={t(copy.scholarships, locale)} className="col-span-2 md:col-span-3" small>
        {t(facts.scholarshipNote, locale)}
      </Fact>
      <Fact icon={ExternalLink} label={t(copy.website, locale)} className="col-span-2 md:col-span-1" small>
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
  small,
  className,
  children,
}: {
  icon: LucideIcon;
  label: string;
  small?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("bg-card px-4 py-3.5", className)}>
      <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="size-3.5" aria-hidden />
        {label}
      </dt>
      <dd className={cn("mt-1 tabular-nums tracking-tight", small ? "text-sm leading-relaxed" : "text-lg font-semibold")}>
        {children}
      </dd>
    </div>
  );
}
