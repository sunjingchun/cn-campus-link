"use client";

import Link from "next/link";
import { useT } from "@/components/site/locale-switch";
import { copy } from "@/lib/copy";

export function SiteFooter() {
  const { t } = useT();

  return (
    <footer className="mt-20 border-t border-border/70 bg-secondary/40">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[2fr_1fr_1fr]">
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <span data-cjk-intentional className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-[#7d3b2e] text-base font-bold text-primary-foreground">
              好
            </span>
            <span className="text-sm font-semibold">
              <span data-cjk-intentional>{copy.brandZh}</span> {copy.brandEn}
            </span>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground">{t(copy.footerBody)}</p>
          <p className="max-w-md text-xs leading-relaxed text-muted-foreground">{t(copy.footerLegal)}</p>
        </div>
        <div className="space-y-2 text-sm">
          <p className="font-medium">{t(copy.browse)}</p>
          <Link href="/" className="block text-muted-foreground hover:text-foreground">
            {t(copy.explore)}
          </Link>
          <Link href="/campus/nju-xianlin" className="block text-muted-foreground hover:text-foreground">
            {t(copy.njuXianlin)}
          </Link>
        </div>
        <div className="space-y-2 text-sm">
          <p className="font-medium">{t(copy.about)}</p>
          <p className="text-muted-foreground">{t(copy.sampleCity)}</p>
          <p className="text-muted-foreground">
            {t(copy.language)}: {t(copy.english)} / {t(copy.chinese)}
          </p>
        </div>
      </div>
    </footer>
  );
}
