import { cn } from "@/lib/utils";

function scoreBand(score: number): { label: string; className: string } {
  if (score >= 80) return { label: "很好", className: "bg-jade text-white" };
  if (score >= 65) return { label: "不错", className: "bg-amber-500 text-white" };
  return { label: "一般", className: "bg-stone-600 text-white" };
}

export function ScorePill({
  score,
  size = "sm",
  className,
}: {
  score: number;
  size?: "sm" | "lg";
  className?: string;
}) {
  const band = scoreBand(score);
  return (
    <span
      className={cn(
        "inline-flex items-baseline gap-1 rounded-full font-semibold tabular-nums shadow-sm",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-base",
        band.className,
        className,
      )}
      title={`综合评分 ${score} / 100`}
    >
      <span className={size === "sm" ? "text-sm" : "text-2xl"}>{score}</span>
      <span className="font-normal opacity-90">{band.label}</span>
    </span>
  );
}
