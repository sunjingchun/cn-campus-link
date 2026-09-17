import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { AnalyticsProvider } from "@/components/analytics/analytics-provider";
import { AuthProvider } from "@/components/auth/auth-provider";
import { LocaleProvider } from "@/components/site/locale-switch";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { Toaster } from "@/components/ui/sonner";
import { currentMember } from "@/lib/auth";
import { copy } from "@/lib/copy";
import { htmlLang, t } from "@/lib/locale";
import { readLocale } from "@/lib/read-locale";
import { ensureSeed, seedDemoEnabled } from "@/lib/seed";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const locale = await readLocale();
  return {
    title: {
      default: t(copy.kicker, locale),
      template: locale === "zh" ? `%s · ${copy.brandZh}` : `%s · ${copy.brandEn}`,
    },
    description: t(copy.homeH1, locale),
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  if (seedDemoEnabled()) await ensureSeed();
  const member = await currentMember();
  const locale = await readLocale();

  return (
    <html
      lang={htmlLang(locale)}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <LocaleProvider locale={locale}>
          <AuthProvider member={member}>
            <AnalyticsProvider>
              <SiteHeader />
              <main className="flex-1">{children}</main>
              <SiteFooter />
              <Toaster position="top-center" richColors />
            </AnalyticsProvider>
          </AuthProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
