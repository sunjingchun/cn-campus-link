"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { track } from "@/components/analytics/track";
import { useAuth } from "@/components/auth/auth-provider";
import { useLandingProgress } from "@/components/discover/landing-progress";
import { useT } from "@/components/site/locale-switch";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { copy, fill } from "@/lib/copy";
import { COUNTRIES, flagOf } from "@/lib/countries";
import type { LandingStepId } from "@/lib/domain";
import type { NoteView } from "@/lib/marks";

function noteDate(timestamp: number, locale: "zh" | "en"): string {
  return new Date(timestamp).toLocaleDateString(locale === "zh" ? "zh-CN" : "en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function AuthorLine({ note, locale }: { note: NoteView; locale: "zh" | "en" }) {
  const country = note.country && COUNTRIES[note.country] ? COUNTRIES[note.country][locale] : "";
  return (
    <p className="text-xs text-muted-foreground" data-note-author>
      <span>{note.displayName}</span>
      {country ? (
        <span>
          {" · "}
          {flagOf(note.country)} {country}
        </span>
      ) : null}
      {note.arrivalYear ? <span> · {fill(copy.arrivedYear, locale, { n: note.arrivalYear })}</span> : null}
      <span> · {noteDate(note.createdAt, locale)}</span>
    </p>
  );
}

export function StepNotes({ stepId }: { stepId: LandingStepId }) {
  const { t, locale } = useT();
  const { member, requireMember } = useAuth();
  const { campusSlug, counts } = useLandingProgress();
  const noteCount = counts[stepId]?.noteCount ?? 0;
  const [notes, setNotes] = useState<NoteView[]>([]);
  const [body, setBody] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!member) return;
    let cancelled = false;
    void fetch(`/api/notes?campus=${encodeURIComponent(campusSlug)}&item_id=${encodeURIComponent(stepId)}`)
      .then((response) => response.json())
      .then((data: { notes?: NoteView[] }) => {
        if (cancelled) return;
        const list = data.notes ?? [];
        setNotes(list);
        if (list.length > 0) track("note_read", { step: stepId });
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [campusSlug, member, stepId]);

  async function publish() {
    if (!requireMember(t(copy.noteReason))) return;
    const text = body.trim();
    if (!text) return;
    setPending(true);
    try {
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          campus_slug: campusSlug,
          item_kind: "landing_step",
          item_id: stepId,
          body: text,
        }),
      });
      if (!response.ok) throw new Error("note failed");
      const data = (await response.json()) as { note?: NoteView };
      if (data.note) setNotes((current) => [data.note!, ...current]);
      setBody("");
      track("note_write", { step: stepId });
    } catch {
      toast.error(t(copy.noteFailed));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-3" data-step-notes={stepId}>
      {noteCount > 0 ? (
        <p className="text-xs text-muted-foreground">{t(copy.nNotes).replace("{n}", String(noteCount))}</p>
      ) : null}

      {member && notes.length > 0 ? (
        <ul className="space-y-3">
          {notes.map((note) => (
            <li key={note.id} className="rounded-lg bg-muted/40 px-3 py-2">
              <AuthorLine note={note} locale={locale} />
              <p className="mt-1 text-sm leading-relaxed">{note.body}</p>
            </li>
          ))}
        </ul>
      ) : null}

      <Textarea
        data-note-body
        value={body}
        onChange={(event) => setBody(event.target.value)}
        placeholder={t(copy.noteBody)}
        rows={3}
      />
      <Button
        type="button"
        size="sm"
        data-leave-note
        disabled={pending}
        onClick={() => void publish()}
      >
        {t(copy.leaveNote)}
      </Button>
    </div>
  );
}
