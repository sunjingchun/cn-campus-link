import {
  GATE_SIDES,
  type CampusOrientation as CampusOrientationData,
  type GateSide,
} from "@/lib/domain";
import { copy } from "@/lib/copy";
import { t, type Locale } from "@/lib/locale";

const SIDE_BOX: Readonly<Record<GateSide, { x: number; y: number; anchor: "start" | "middle" | "end" }>> = {
  north: { x: 320, y: 28, anchor: "middle" },
  east: { x: 628, y: 168, anchor: "end" },
  south: { x: 320, y: 430, anchor: "middle" },
  west: { x: 12, y: 168, anchor: "start" },
};

const SIDE_TICK: Readonly<Record<GateSide, { x1: number; y1: number; x2: number; y2: number }>> = {
  north: { x1: 320, y1: 118, x2: 320, y2: 86 },
  east: { x1: 500, y1: 230, x2: 548, y2: 230 },
  south: { x1: 320, y1: 342, x2: 320, y2: 374 },
  west: { x1: 140, y1: 230, x2: 92, y2: 230 },
};

export function CampusOrientation({
  orientation,
  campusLabel,
  locale,
}: {
  orientation: CampusOrientationData;
  campusLabel: string;
  locale: Locale;
}) {
  const bySide = Object.fromEntries(orientation.gates.map((gate) => [gate.side, gate])) as Record<
    GateSide,
    (typeof orientation.gates)[number]
  >;

  return (
    <figure className="overflow-hidden rounded-2xl border bg-card text-foreground">
      <svg
        viewBox="0 0 640 480"
        role="img"
        className="h-auto w-full max-w-full"
        aria-label={t(copy.orientation, locale)}
      >
        <title>{t(copy.orientation, locale)}</title>
        <rect
          x="140"
          y="118"
          width="360"
          height="224"
          rx="18"
          className="fill-secondary/70 stroke-foreground/45"
          strokeWidth="2"
        />
        <text x="320" y="228" textAnchor="middle" fill="currentColor" fontSize="16" fontWeight="600">
          {campusLabel}
        </text>
        <text x="320" y="252" textAnchor="middle" fill="currentColor" fontSize="12" opacity="0.7">
          {t(orientation.address, locale)}
        </text>
        {GATE_SIDES.map((side) => {
          const gate = bySide[side];
          const box = SIDE_BOX[side];
          const tick = SIDE_TICK[side];
          const minutes =
            gate.walkMinutes === null
              ? t(copy.walkUnpublished, locale)
              : locale === "zh"
                ? `步行 ${gate.walkMinutes} 分钟`
                : `${gate.walkMinutes} min walk`;
          const name = t(gate.name, locale);
          const noteLines = wrapLabel(t(gate.note, locale), side === "east" || side === "west" ? 16 : 32);
          return (
            <g key={side}>
              <line
                x1={tick.x1}
                y1={tick.y1}
                x2={tick.x2}
                y2={tick.y2}
                className="stroke-foreground/50"
                strokeWidth="2"
              />
              <circle cx={tick.x2} cy={tick.y2} r="5" className="fill-primary" />
              <text
                x={box.x}
                y={box.y}
                textAnchor={box.anchor}
                fill="currentColor"
                fontSize="13"
                fontWeight="600"
              >
                {name}
              </text>
              {noteLines.map((line, index) => (
                <text
                  key={`${side}-note-${index}`}
                  x={box.x}
                  y={box.y + 16 + index * 14}
                  textAnchor={box.anchor}
                  fill="currentColor"
                  fontSize="11"
                  opacity="0.72"
                >
                  {line}
                </text>
              ))}
              <text
                x={box.x}
                y={box.y + 16 + noteLines.length * 14}
                textAnchor={box.anchor}
                fill="currentColor"
                fontSize="11"
                fontWeight="600"
              >
                {minutes}
              </text>
            </g>
          );
        })}
      </svg>
    </figure>
  );
}

function wrapLabel(text: string, width: number): string[] {
  if (text.length <= width) return [text];
  const words = text.split(/\s+/);
  if (words.length === 1) {
    const lines: string[] = [];
    for (let i = 0; i < text.length; i += width) lines.push(text.slice(i, i + width));
    return lines.slice(0, 3);
  }
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > width && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines.slice(0, 3);
}
