"use client";

import { X } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function TagInput({
  value,
  onChange,
  max,
  placeholder,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  max: number;
  placeholder: string;
}) {
  const [draft, setDraft] = useState("");

  function add(raw: string) {
    const tag = raw.trim();
    if (!tag || value.includes(tag) || value.length >= max) return;
    onChange([...value, tag]);
    setDraft("");
  }

  return (
    <div className="space-y-2">
      {value.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {value.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => onChange(value.filter((item) => item !== tag))}
              className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs text-secondary-foreground transition hover:bg-destructive/10 hover:text-destructive"
            >
              {tag}
              <X className="size-3" />
            </button>
          ))}
        </div>
      ) : null}
      <Input
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            add(draft);
          }
        }}
        placeholder={value.length >= max ? `最多 ${max} 个` : placeholder}
        disabled={value.length >= max}
        className={cn(value.length >= max && "opacity-60")}
      />
      <p className="text-xs text-muted-foreground">
        回车添加，点标签删除 · {value.length} / {max}
      </p>
    </div>
  );
}
