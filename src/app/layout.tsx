import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { AnalyticsProvider } from "@/components/analytics/analytics-provider";
import { AuthProvider } from "@/components/auth/auth-provider";
import { LocaleProvider } from "@/components/site/locale-switch";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { Toaster } from "@/components/ui/sonner";
import { campusOptions } from "@/data";
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
      default: t(copy.testTitle, locale),
      template: t(copy.testTitleTemplate, locale),
    },
    description: t(copy.testDescription, locale),
    robots: {
      index: false,
      follow: false,
      nocache: true,
      googleBot: {
        index: false,
        follow: false,
        noimageindex: true,
        "max-video-preview": 0,
        "max-image-preview": "none",
        "max-snippet": 0,
      },
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
          <AuthProvider member={member} campuses={campusOptions()}>
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
