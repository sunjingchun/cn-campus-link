"use client";

import { useState } from "react";
import { useLandingProgress } from "@/components/discover/landing-progress";
import { useT } from "@/components/site/locale-switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { copy } from "@/lib/copy";
import type { LandingStepId } from "@/lib/domain";

export function StepMark({ stepId }: { stepId: LandingStepId }) {
  const { t, fill } = useT();
  const { mine, counts, pending, mark, unmark } = useLandingProgress();
  const current = mine[stepId];
  const [onDate, setOnDate] = useState(current?.onDate ?? "");
  const busy = pending[stepId] === true;
  const plannedThisWeek = counts[stepId]?.plannedThisWeek ?? 0;

  return (
    <div className="space-y-3 rounded-xl border bg-muted/30 px-3 py-3" data-step-mark={stepId}>
      {plannedThisWeek > 0 ? (
        <p className="text-xs text-muted-foreground">{fill(copy.nPlanning, { n: plannedThisWeek })}</p>
      ) : (
        <p className="text-xs text-muted-foreground">{t(copy.markThisStep)}</p>
      )}

      <div className="flex min-w-0 flex-wrap items-end gap-2">
        <div className="min-w-0 flex-1">
          <Label htmlFor={`mark-date-${stepId}`} className="text-xs text-muted-foreground">
            {t(copy.markDate)}
          </Label>
          <Input
            id={`mark-date-${stepId}`}
            type="date"
            name="on_date"
            value={onDate}
            onChange={(event) => setOnDate(event.target.value)}
            className="mt-1"
          />
        </div>
        <Button
          type="button"
          size="sm"
          disabled={busy}
          data-mark-save
          onClick={() => void mark(stepId, { kind: current?.kind === "done" ? "done" : "planned", onDate: onDate || null })}
        >
          {busy ? t(copy.markSaving) : t(copy.markSave)}
        </Button>
      </div>

      {current ? (
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              data-mark-done
              checked={current.kind === "done"}
              disabled={busy}
              onChange={(event) =>
                void mark(stepId, { kind: event.target.checked ? "done" : "planned", onDate: onDate || current.onDate })
              }
            />
            {t(copy.markDone)}
          </label>
          {current.kind === "done" ? (
            <span className="text-xs font-medium text-primary">{t(copy.markedDone)}</span>
          ) : null}
          <Button type="button" variant="ghost" size="sm" data-unmark disabled={busy} onClick={() => void unmark(stepId)}>
            {t(copy.unmark)}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
