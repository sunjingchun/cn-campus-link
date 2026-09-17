"use client";

import { createContext, useContext, type ReactNode } from "react";
import { track } from "@/components/analytics/track";
import { copy, fill } from "@/lib/copy";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  t,
  type Locale,
  type Localized,
} from "@/lib/locale";
import { cn } from "@/lib/utils";

const LocaleContext = createContext<Locale>(DEFAULT_LOCALE);

export function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

export function useLocale(): Locale {
  return useContext(LocaleContext);
}

export function useT() {
  const locale = useLocale();
  return {
    locale,
    t: (value: Localized) => t(value, locale),
    fill: (value: Localized, vars: Record<string, string | number>) => fill(value, locale, vars),
  };
}

export function Cjk({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span data-cjk-intentional className={className}>
      {children}
    </span>
  );
}

function persistLocale(next: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${next}; Path=/; Max-Age=31536000; SameSite=Lax`;
  track("locale_switch", { to: next });
  window.location.reload();
}

export function LocaleSwitch({ className }: { className?: string }) {
  const locale = useLocale();
  return (
    <div
      role="group"
      aria-label={t(copy.language, locale)}
      className={cn("inline-flex rounded-lg border bg-background p-0.5 text-xs", className)}
    >
      <button
        type="button"
        aria-pressed={locale === "en"}
        onClick={() => locale !== "en" && persistLocale("en")}
        className={cn(
          "rounded-md px-2 py-1 transition-colors",
          locale === "en" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground",
        )}
      >
        {t(copy.english, locale)}
      </button>
      <button
        type="button"
        aria-pressed={locale === "zh"}
        onClick={() => locale !== "zh" && persistLocale("zh")}
        className={cn(
          "rounded-md px-2 py-1 transition-colors",
          locale === "zh" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground",
        )}
      >
        <Cjk>{t(copy.chinese, locale)}</Cjk>
      </button>
    </div>
  );
}
