"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { track } from "@/components/analytics/track";
import { ProgressRing } from "@/components/discover/progress-ring";
import { useT } from "@/components/site/locale-switch";
import { copy } from "@/lib/copy";
import { LANDING_STEPS, type LandingStepId } from "@/lib/domain";
import type { MarkKind, MineMark, StepCounts } from "@/lib/marks";

type MineMap = Partial<Record<LandingStepId, MineMark>>;

type LandingProgressValue = {
  campusSlug: string;
  mine: MineMap;
  counts: Record<LandingStepId, StepCounts>;
  pending: Partial<Record<LandingStepId, boolean>>;
  mark: (itemId: LandingStepId, input: { kind: MarkKind; onDate: string | null }) => Promise<boolean>;
  unmark: (itemId: LandingStepId) => Promise<boolean>;
};

const LandingProgressContext = createContext<LandingProgressValue | null>(null);

export function useLandingProgress(): LandingProgressValue {
  const value = useContext(LandingProgressContext);
  if (!value) throw new Error("useLandingProgress must be used inside LandingProgress");
  return value;
}

function indexMine(list: MineMark[]): MineMap {
  const out: MineMap = {};
  for (const mark of list) out[mark.itemId] = mark;
  return out;
}

export function LandingProgress({
  campusSlug,
  initialMine,
  initialCounts,
  children,
}: {
  campusSlug: string;
  initialMine: MineMark[];
  initialCounts: Record<LandingStepId, StepCounts>;
  children: ReactNode;
}) {
  const { t } = useT();
  const [mine, setMine] = useState<MineMap>(() => indexMine(initialMine));
  const [counts] = useState(initialCounts);
  const [pending, setPending] = useState<Partial<Record<LandingStepId, boolean>>>({});

  const mark = useCallback(
    async (itemId: LandingStepId, input: { kind: MarkKind; onDate: string | null }) => {
      const previous = mine[itemId];
      const next: MineMark = { itemId, kind: input.kind, onDate: input.onDate };
      setMine((current) => ({ ...current, [itemId]: next }));
      setPending((current) => ({ ...current, [itemId]: true }));
      try {
        const response = await fetch("/api/marks", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            campus_slug: campusSlug,
            item_kind: "landing_step",
            item_id: itemId,
            kind: input.kind,
            on_date: input.onDate,
          }),
        });
        if (!response.ok) throw new Error("mark failed");
        track("step_mark", { step: itemId, kind: input.kind });
        if (input.kind === "done") track("step_done", { step: itemId });
        return true;
      } catch {
        setMine((current) => {
          const copyMine = { ...current };
          if (previous) copyMine[itemId] = previous;
          else delete copyMine[itemId];
          return copyMine;
        });
        toast.error(t(copy.markFailed));
        return false;
      } finally {
        setPending((current) => ({ ...current, [itemId]: false }));
      }
    },
    [campusSlug, mine, t],
  );

  const unmark = useCallback(
    async (itemId: LandingStepId) => {
      const previous = mine[itemId];
      setMine((current) => {
        const copyMine = { ...current };
        delete copyMine[itemId];
        return copyMine;
      });
      setPending((current) => ({ ...current, [itemId]: true }));
      try {
        const response = await fetch("/api/marks", {
          method: "DELETE",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            campus_slug: campusSlug,
            item_kind: "landing_step",
            item_id: itemId,
          }),
        });
        if (!response.ok) throw new Error("unmark failed");
        return true;
      } catch {
        if (previous) setMine((current) => ({ ...current, [itemId]: previous }));
        toast.error(t(copy.markFailed));
        return false;
      } finally {
        setPending((current) => ({ ...current, [itemId]: false }));
      }
    },
    [campusSlug, mine, t],
  );

  const done = LANDING_STEPS.filter((id) => mine[id]).length;
  const value = useMemo(
    () => ({ campusSlug, mine, counts, pending, mark, unmark }),
    [campusSlug, mine, counts, pending, mark, unmark],
  );

  return (
    <LandingProgressContext.Provider value={value}>
      <div className="mb-6">
        <ProgressRing done={done} total={LANDING_STEPS.length} />
      </div>
      {children}
    </LandingProgressContext.Provider>
  );
}
