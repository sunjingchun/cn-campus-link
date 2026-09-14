"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(timer);
  }, [copied]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      toast.error("复制失败，请长按文字手动复制");
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={copy}
      aria-live="polite"
      className={cn(copied && "border-jade/40 bg-jade/10 text-jade hover:bg-jade/15", className)}
    >
      {copied ? <Check /> : <Copy />}
      {copied ? "已复制" : label}
    </Button>
  );
}
