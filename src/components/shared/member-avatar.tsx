import { flagOf } from "@/lib/countries";
import { cn } from "@/lib/utils";

const SIZES = {
  sm: "h-8 w-8 text-[11px]",
  md: "h-10 w-10 text-sm",
  lg: "h-16 w-16 text-xl",
  xl: "h-24 w-24 text-3xl",
} as const;

/**
 * Avatars are generated from the member's stored hue, so a profile looks like
 * someone from the moment it is created and nobody has to upload a photo.
 */
export function MemberAvatar({
  name,
  hue,
  country,
  size = "md",
  className,
}: {
  name: string;
  hue: number;
  country?: string;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const initials = name.trim().slice(0, 2).toUpperCase();
  return (
    <span className={cn("relative inline-flex shrink-0", className)}>
      <span
        className={cn(
          "flex items-center justify-center rounded-full font-semibold text-white shadow-sm ring-2 ring-background",
          SIZES[size],
        )}
        style={{
          background: `linear-gradient(140deg, hsl(${hue} 70% 62%), hsl(${(hue + 48) % 360} 68% 44%))`,
        }}
      >
        {initials}
      </span>
      {country ? (
        <span
          className="absolute -bottom-0.5 -right-0.5 rounded-full bg-background px-0.5 text-[10px] leading-4 shadow-sm"
          title={country}
        >
          {flagOf(country)}
        </span>
      ) : null}
    </span>
  );
}
