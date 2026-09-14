import { CircleCheck, CircleX } from "lucide-react";
import { cn } from "@/lib/utils";

export function ProsCons({
  pros,
  cons,
  className,
}: {
  pros: readonly string[];
  cons: readonly string[];
  className?: string;
}) {
  return (
    <div className={cn("grid gap-4 md:grid-cols-2", className)}>
      <section className="rounded-2xl border border-jade/30 bg-jade/5 p-5">
        <h3 className="flex items-baseline gap-2 text-base font-semibold text-jade">
          优点 <span className="text-xs font-normal opacity-80">What people love</span>
        </h3>
        <ul className="mt-3 space-y-2.5">
          {pros.map((item) => (
            <li key={item} className="flex gap-2.5 text-sm leading-relaxed">
              <CircleCheck className="mt-0.5 size-4 shrink-0 text-jade" aria-hidden />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>
      <section className="rounded-2xl border border-primary/30 bg-primary/5 p-5">
        <h3 className="flex items-baseline gap-2 text-base font-semibold text-primary">
          缺点 <span className="text-xs font-normal opacity-80">What wears you down</span>
        </h3>
        <ul className="mt-3 space-y-2.5">
          {cons.map((item) => (
            <li key={item} className="flex gap-2.5 text-sm leading-relaxed">
              <CircleX className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
