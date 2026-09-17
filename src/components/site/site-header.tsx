"use client";

import Link from "next/link";
import { AuthMenu } from "@/components/auth/auth-menu";
import { LocaleSwitch, useT } from "@/components/site/locale-switch";
import { copy } from "@/lib/copy";

export function SiteHeader() {
  const { t } = useT();

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <aside
        aria-label={t(copy.testBannerAria)}
        className="border-b border-primary-foreground/20 bg-primary px-4 py-2 text-primary-foreground"
      >
        <p className="mx-auto max-w-7xl text-center text-xs leading-relaxed sm:text-sm">
          <strong className="font-semibold">{t(copy.testBannerLead)}</strong>
          {t(copy.testBannerBody)}
        </p>
      </aside>
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-2 px-4 sm:gap-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span data-cjk-intentional className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-[#7d3b2e] text-lg font-bold text-primary-foreground shadow-sm">
            好
          </span>
          <span className="hidden leading-tight sm:block">
            <span data-cjk-intentional className="block text-sm font-semibold tracking-tight">{copy.brandZh}</span>
            <span className="block text-[11px] text-muted-foreground">{copy.brandEn}</span>
          </span>
        </Link>

        <nav className="ml-2 hidden items-center gap-1 text-sm sm:flex">
          <Link
            href="/"
            className="rounded-md px-3 py-1.5 text-muted-foreground transition hover:bg-accent hover:text-foreground"
          >
            {t(copy.explore)}
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <LocaleSwitch />
          <AuthMenu />
        </div>
      </div>
    </header>
  );
}
