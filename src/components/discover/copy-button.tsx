"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useT } from "@/components/site/locale-switch";
import { Button } from "@/components/ui/button";
import { copy as ui } from "@/lib/copy";
import { cn } from "@/lib/utils";

export function CopyButton({
  text,
  label,
  className,
}: {
  text: string;
  label: string;
  className?: string;
}) {
  const { t } = useT();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(timer);
  }, [copied]);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      toast.error(t(ui.copyFailed));
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      data-copy-address
      onClick={onCopy}
      aria-live="polite"
      className={cn(copied && "border-jade/40 bg-jade/10 text-jade hover:bg-jade/15", className)}
    >
      {copied ? <Check /> : <Copy />}
      {copied ? t(ui.copied) : label}
    </Button>
  );
}
