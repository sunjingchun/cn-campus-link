import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/components/auth/auth-provider";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { Toaster } from "@/components/ui/sonner";
import { campusOptions } from "@/data";
import { currentMember } from "@/lib/auth";
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
    default: "你好校园 NihaoCampus · 来华留学生的城市与校区指南",
    template: "%s · 你好校园 NihaoCampus",
  },
  description:
    "按城市和大学校区整理的来华留学生指南：生活成本、落地清单、周边吃住、在读学生的留言板和聊天室。",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Fills an empty database with demo members and threads on first render, so a
  // fresh clone opens onto a community instead of a set of empty states.
  await ensureSeed();
  const member = await currentMember();

  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <AuthProvider member={member} campuses={campusOptions()}>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
          <Toaster position="top-center" richColors />
        </AuthProvider>
      </body>
    </html>
  );
}
