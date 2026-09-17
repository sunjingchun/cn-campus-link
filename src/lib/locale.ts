import { EN_COPY } from "@/data/en-copy";

export const LOCALES = ["en", "zh"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "nihaocampus_locale";

export type Localized = { zh: string; en: string };

export function parseLocale(raw: string | undefined | null): Locale {
  return raw === "zh" ? "zh" : "en";
}

export function htmlLang(locale: Locale): "en" | "zh-CN" {
  return locale === "zh" ? "zh-CN" : "en";
}

export function t(value: Localized, locale: Locale): string {
  return value[locale];
}

export function localeNumber(locale: Locale): string {
  return locale === "zh" ? "zh-CN" : "en-US";
}

/** Build a bilingual string. Pass `en` for paired fields; look up the rest in `EN_COPY`. */
export function L(zh: string, en?: string): Localized {
  if (en !== undefined) return { zh, en };
  const resolved = EN_COPY[zh];
  if (!resolved) throw new Error(`Missing English for ${JSON.stringify(zh)}`);
  return { zh, en: resolved };
}