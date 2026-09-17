import { CircleCheck, CircleX } from "lucide-react";
import { copy } from "@/lib/copy";
import { t, type Locale, type Localized } from "@/lib/locale";
import { cn } from "@/lib/utils";

export function ProsCons({
  pros,
  cons,
  locale,
  className,
}: {
  pros: readonly Localized[];
  cons: readonly Localized[];
  locale: Locale;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-4 md:grid-cols-2", className)}>
      <section className="rounded-2xl border border-jade/30 bg-jade/5 p-5">
        <h3 className="text-base font-semibold text-jade">{t(copy.pros, locale)}</h3>
        <ul className="mt-3 space-y-2.5">
          {pros.map((item) => (
            <li key={item.zh} className="flex gap-2.5 text-sm leading-relaxed">
              <CircleCheck className="mt-0.5 size-4 shrink-0 text-jade" aria-hidden />
              <span>{t(item, locale)}</span>
            </li>
          ))}
        </ul>
      </section>
      <section className="rounded-2xl border border-primary/30 bg-primary/5 p-5">
        <h3 className="text-base font-semibold text-primary">{t(copy.cons, locale)}</h3>
        <ul className="mt-3 space-y-2.5">
          {cons.map((item) => (
            <li key={item.zh} className="flex gap-2.5 text-sm leading-relaxed">
              <CircleX className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
              <span>{t(item, locale)}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
