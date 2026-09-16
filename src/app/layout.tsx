import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AnalyticsProvider } from "@/components/analytics/analytics-provider";
import { AuthProvider } from "@/components/auth/auth-provider";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { Toaster } from "@/components/ui/sonner";
import { campusOptions } from "@/data";
import { currentMember } from "@/lib/auth";
import { ensureAnonId } from "@/lib/events";
import { ensureSeed } from "@/lib/seed";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "[测试版] 你好校园 NihaoCampus · 来华留学生的城市与校区指南",
    template: "%s · [测试版] 你好校园 NihaoCampus",
  },
  description:
    "测试预览：当前城市、价格、成员及社区内容均为演示数据，请勿用于申请、签证或生活决策。",
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

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Fills an empty database with demo members and threads on first render, so a
  // fresh clone opens onto a community instead of a set of empty states.
  await ensureSeed();
  await ensureAnonId();
  const member = await currentMember();

  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <AuthProvider member={member} campuses={campusOptions()}>
          <AnalyticsProvider>
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
            <Toaster position="top-center" richColors />
          </AnalyticsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
