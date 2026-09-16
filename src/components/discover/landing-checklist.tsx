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
import {
  cny,
  LANDING_STEP_META,
  LANDING_STEPS,
  type LandingChecklist as LandingChecklistData,
  type LandingStepId,
} from "@/lib/domain";
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

function fee(feeCny: number | null): string {
  if (feeCny === null) return "费用视情况";
  if (feeCny === 0) return "免费";
  return cny(feeCny);
}

/**
 * The nine steps in LANDING_STEPS order, drawn as a timeline a student ticks
 * through. The bring-list checkboxes are plain HTML so ticking works with no
 * JavaScript; they reset on reload, which is fine for a list you do once.
 */
export function LandingChecklist({
  landing,
  className,
}: {
  landing: LandingChecklistData;
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
                      第 {index + 1} 步 / {LANDING_STEPS.length}
                    </p>
                    <h3 className="mt-0.5 flex flex-wrap items-baseline gap-x-2 text-lg font-semibold tracking-tight">
                      {meta.zh}
                      <span className="text-sm font-normal text-muted-foreground">{meta.en}</span>
                    </h3>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                    <Clock className="size-3.5" aria-hidden />
                    {step.deadline}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{meta.why}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 tabular-nums">
                    <Wallet className="size-3.5" aria-hidden />
                    {fee(step.feeCny)}
                  </span>
                  <SourceLine sources={step.sources} unverified="费用未核实" />
                  {step.minutes !== null ? (
                    <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 tabular-nums">
                      <Timer className="size-3.5" aria-hidden />
                      现场约 {step.minutes} 分钟
                    </span>
                  ) : null}
                </div>
              </header>

              <div className="grid gap-4 px-4 py-4 sm:px-5 lg:grid-cols-2">
                <PlaceBlock place={step.place} className="border-0 bg-muted/40" />

                <div className="space-y-4">
                  <div>
                    <p className="mb-2 text-xs font-medium text-muted-foreground">
                      带上 <span className="opacity-70">Bring</span>
                    </p>
                    <ul className="space-y-1.5">
                      {step.bring.map((item) => (
                        <li key={item}>
                          <label className="flex cursor-pointer items-start gap-2.5 rounded-lg px-1 py-0.5 text-sm transition-colors has-checked:text-muted-foreground has-checked:line-through hover:bg-muted/60">
                            <input type="checkbox" className="mt-0.5 size-4 shrink-0 rounded accent-primary" />
                            <span>{item}</span>
                          </label>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {step.tips.length > 0 ? (
                    <div>
                      <p className="mb-2 text-xs font-medium text-muted-foreground">
                        过来人的话 <span className="opacity-70">Tips</span>
                      </p>
                      <ul className="space-y-2">
                        {step.tips.map((tip) => (
                          <li key={tip} className="flex gap-2 text-sm leading-relaxed">
                            <Lightbulb className="mt-1 size-3.5 shrink-0 text-amber-500" aria-hidden />
                            <span>{tip}</span>
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
                    <strong className="font-semibold">注意 </strong>
                    {step.warning}
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
