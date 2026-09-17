import {
  Clock,
  CreditCard,
  GraduationCap,
  HeartPulse,
  IdCard,
  Landmark,
  Lightbulb,
  QrCode,
  ShieldCheck,
  Smartphone,
  Stethoscope,
  Timer,
  TriangleAlert,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { requirePlace } from "@/data";
import { copy, fill } from "@/lib/copy";
import {
  cny,
  LANDING_STEP_META,
  LANDING_STEPS,
  type LandingChecklist as LandingChecklistData,
  type LandingStepId,
} from "@/lib/domain";
import { t, type Locale } from "@/lib/locale";
import { cn } from "@/lib/utils";
import { PlaceBlock } from "./place-block";
import { SourceLine } from "./source-line";

const STEP_ICON: Readonly<Record<LandingStepId, LucideIcon>> = {
  registration: GraduationCap,
  tempResidence: ShieldCheck,
  healthCheck: Stethoscope,
  residencePermit: IdCard,
  simCard: Smartphone,
  bankAccount: Landmark,
  mobilePay: QrCode,
  campusCard: CreditCard,
  insurance: HeartPulse,
};

function feeLabel(feeCny: number | null, locale: Locale): string {
  if (feeCny === null) return t(copy.feeVaries, locale);
  if (feeCny === 0) return t(copy.free, locale);
  return cny(feeCny);
}

export function LandingChecklist({
  landing,
  locale,
  className,
}: {
  landing: LandingChecklistData;
  locale: Locale;
  className?: string;
}) {
  return (
    <ol className={cn("relative space-y-6", className)}>
      <span
        className="absolute top-6 bottom-6 left-[19px] w-0.5 bg-gradient-to-b from-primary/60 via-border to-border sm:left-[23px]"
        aria-hidden
      />
      {LANDING_STEPS.map((id, index) => {
        const meta = LANDING_STEP_META[id];
        const step = landing[id];
        const Icon = STEP_ICON[id];
        return (
          <li
            key={id}
            id={`landing-${id}`}
            className="animate-rise-in relative grid grid-cols-[40px_minmax(0,1fr)] gap-x-3 sm:grid-cols-[48px_minmax(0,1fr)] sm:gap-x-4"
            style={{ animationDelay: `${Math.min(index, 8) * 50}ms` }}
          >
            <div className="relative z-10 grid size-10 place-items-center rounded-full border-2 border-primary/30 bg-background text-primary shadow-sm sm:size-12">
              <Icon className="size-4 sm:size-5" aria-hidden />
              <span className="absolute -right-1 -bottom-1 grid size-5 place-items-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground tabular-nums">
                {index + 1}
              </span>
            </div>

            <article className="rounded-2xl border bg-card shadow-sm">
              <header className="border-b px-4 py-4 sm:px-5">
                <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {fill(copy.stepN, locale, { n: index + 1, total: LANDING_STEPS.length })}
                    </p>
                    <h3 className="mt-0.5 text-lg font-semibold tracking-tight">{t(meta, locale)}</h3>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                    <Clock className="size-3.5" aria-hidden />
                    {t(step.deadline, locale)}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t(meta.why, locale)}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 tabular-nums">
                    <Wallet className="size-3.5" aria-hidden />
                    {feeLabel(step.feeCny, locale)}
                  </span>
                  <SourceLine sources={step.sources} unverified={t(copy.feeUnverified, locale)} locale={locale} />
                  {step.minutes !== null ? (
                    <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 tabular-nums">
                      <Timer className="size-3.5" aria-hidden />
                      {fill(copy.minutesOnSite, locale, { n: step.minutes })}
                    </span>
                  ) : null}
                </div>
              </header>

              <div className="grid gap-4 px-4 py-4 sm:px-5 lg:grid-cols-2">
                <PlaceBlock place={requirePlace(step.place)} locale={locale} className="border-0 bg-muted/40" />

                <div className="space-y-4">
                  <div>
                    <p className="mb-2 text-xs font-medium text-muted-foreground">{t(copy.bring, locale)}</p>
                    <ul className="space-y-1.5">
                      {step.bring.map((item) => (
                        <li key={item.zh}>
                          <label className="flex cursor-pointer items-start gap-2.5 rounded-lg px-1 py-0.5 text-sm transition-colors has-checked:text-muted-foreground has-checked:line-through hover:bg-muted/60">
                            <input type="checkbox" className="mt-0.5 size-4 shrink-0 rounded accent-primary" />
                            <span>{t(item, locale)}</span>
                          </label>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {step.tips.length > 0 ? (
                    <div>
                      <p className="mb-2 text-xs font-medium text-muted-foreground">{t(copy.tips, locale)}</p>
                      <ul className="space-y-2">
                        {step.tips.map((tip) => (
                          <li key={tip.zh} className="flex gap-2 text-sm leading-relaxed">
                            <Lightbulb className="mt-1 size-3.5 shrink-0 text-amber-500" aria-hidden />
                            <span>{t(tip, locale)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              </div>

              {step.warning ? (
                <p className="mx-4 mb-4 flex gap-2.5 rounded-xl border border-destructive/30 bg-destructive/5 px-3.5 py-3 text-sm leading-relaxed text-destructive sm:mx-5 sm:mb-5">
                  <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
                  <span>
                    <strong className="font-semibold">{t(copy.warning, locale)} </strong>
                    {t(step.warning, locale)}
                  </span>
                </p>
              ) : null}
            </article>
          </li>
        );
      })}
    </ol>
  );
}
