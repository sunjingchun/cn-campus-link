import { cn } from "@/lib/utils";
import type { CardArt as CardArtData, Motif } from "@/lib/domain";

/**
 * Cards are drawn in the browser. Each motif is one silhouette path over a
 * drifting three-colour mesh, so a city tile needs no photo, no CDN and no
 * licence, and a new city only has to pick a motif and three colours.
 */
const MOTIF_PATH: Readonly<Record<Motif, string>> = {
  pagoda:
    "M0 140 L0 124 L118 124 L138 112 L158 112 L158 100 L144 100 L174 84 L164 84 L186 68 L178 68 L200 48 L222 68 L214 68 L236 84 L226 84 L256 100 L242 100 L242 112 L262 112 L282 124 L400 124 L400 140 Z",
  cityWall:
    "M0 140 L0 104 L40 104 L40 96 L52 96 L52 104 L64 104 L64 96 L76 96 L76 104 L140 104 L140 66 L152 58 L248 58 L260 66 L260 104 L324 104 L324 96 L336 96 L336 104 L348 104 L348 96 L360 96 L360 104 L400 104 L400 140 Z",
  bridge:
    "M0 140 L0 120 L64 120 L64 66 L78 66 L78 120 L140 120 Q200 86 260 120 L322 120 L322 66 L336 66 L336 120 L400 120 L400 140 Z",
  tower:
    "M0 140 L0 112 L58 112 L58 84 L82 84 L82 112 L148 112 L148 70 L166 70 L166 112 L184 112 L184 48 L190 48 Q176 32 194 28 Q214 30 210 48 L216 48 L216 112 L252 112 L252 58 L270 58 L270 112 L320 112 L320 90 L344 90 L344 112 L400 112 L400 140 Z",
  lake:
    "M0 140 L0 110 Q60 82 120 104 Q158 118 188 106 L188 92 L182 86 L218 86 L212 92 L212 106 Q244 118 282 100 Q342 72 400 104 L400 140 Z",
  gate:
    "M0 140 L0 118 L70 118 L70 104 L84 104 L84 118 L128 118 L128 78 L116 70 L284 70 L272 78 L272 118 L316 118 L316 104 L330 104 L330 118 L400 118 L400 140 Z",
  skyline:
    "M0 140 L0 96 L28 96 L28 74 L52 74 L52 110 L78 110 L78 60 L96 60 L96 44 L112 44 L112 60 L132 60 L132 100 L160 100 L160 82 L186 82 L186 120 L214 120 L214 66 L238 66 L238 48 L252 48 L252 66 L272 66 L272 104 L300 104 L300 86 L326 86 L326 112 L352 112 L352 78 L378 78 L378 98 L400 98 L400 140 Z",
  temple:
    "M0 140 L0 122 L108 122 L108 104 Q140 76 200 74 Q260 76 292 104 L292 122 L400 122 L400 140 Z",
  mountain:
    "M0 140 L0 106 L70 52 L128 96 L168 70 L232 118 L286 66 L340 104 L400 74 L400 140 Z",
  harbour:
    "M0 140 L0 120 L40 120 L40 76 L120 76 L120 84 L52 84 L52 120 L150 120 L150 68 L236 68 L236 76 L162 76 L162 120 L260 120 L260 96 L300 96 L300 120 L340 120 L340 88 L378 88 L378 120 L400 120 L400 140 Z",
};

const RIDGE_PATH =
  "M0 140 L0 116 Q80 92 160 112 Q240 132 320 104 Q360 92 400 100 L400 140 Z";

export function CardArt({
  art,
  className,
  interactive = true,
}: {
  art: CardArtData;
  className?: string;
  interactive?: boolean;
}) {
  return (
    <div
      className={cn("grain absolute inset-0 overflow-hidden", className)}
      style={{ background: `linear-gradient(150deg, ${art.from}, ${art.via} 52%, ${art.to})` }}
      aria-hidden
    >
      <div
        className="animate-drift absolute -left-1/4 -top-1/3 h-[130%] w-[90%] rounded-full opacity-70 blur-3xl"
        style={{ background: art.from }}
      />
      <div
        className="animate-drift absolute -right-1/4 top-1/4 h-[120%] w-[80%] rounded-full opacity-60 blur-3xl"
        style={{ background: art.via, animationDelay: "-6s" }}
      />
      <div
        className="animate-drift absolute bottom-[-40%] left-1/4 h-[110%] w-[70%] rounded-full opacity-50 blur-3xl"
        style={{ background: art.to, animationDelay: "-12s" }}
      />

      <svg
        viewBox="0 0 400 140"
        preserveAspectRatio="none"
        className={cn(
          "absolute inset-x-0 bottom-0 h-[62%] w-full transition-transform duration-700 ease-out",
          interactive && "group-hover:scale-[1.06]",
        )}
      >
        <path d={RIDGE_PATH} fill="rgba(12,10,9,0.22)" />
        <path d={MOTIF_PATH[art.motif]} fill="rgba(12,10,9,0.42)" />
      </svg>

      <div className="absolute inset-0 bg-gradient-to-t from-stone-950/75 via-stone-950/10 to-transparent" />

      {interactive ? (
        <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="animate-[sheen_1.1s_ease-out] absolute inset-y-0 w-1/3 bg-white/25 blur-xl" />
        </div>
      ) : null}
    </div>
  );
}
