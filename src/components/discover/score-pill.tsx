import { copy } from "@/lib/copy";
import { t, type Locale } from "@/lib/locale";
import { cn } from "@/lib/utils";

function scoreBand(score: number, locale: Locale): { label: string; className: string } {
  if (score >= 80) return { label: t(copy.scoreGood, locale), className: "bg-jade text-white" };
  if (score >= 65) return { label: t(copy.scoreOk, locale), className: "bg-amber-500 text-white" };
  return { label: t(copy.scoreMeh, locale), className: "bg-stone-600 text-white" };
}

export function ScorePill({
  score,
  locale,
  size = "sm",
  className,
}: {
  score: number;
  locale: Locale;
  size?: "sm" | "lg";
  className?: string;
}) {
  const band = scoreBand(score, locale);
  return (
    <span
      className={cn(
        "inline-flex items-baseline gap-1 rounded-full font-semibold tabular-nums shadow-sm",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-base",
        band.className,
        className,
      )}
      title={copy.scoreTitle[locale].replace("{n}", String(score))}
    >
      <span className={size === "sm" ? "text-sm" : "text-2xl"}>{score}</span>
      <span className="font-normal opacity-90">{band.label}</span>
    </span>
  );
}
