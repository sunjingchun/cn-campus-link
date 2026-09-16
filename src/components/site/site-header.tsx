import Link from "next/link";
import { AuthMenu } from "@/components/auth/auth-menu";

const NAV = [{ href: "/", label: "城市与校区", en: "Explore" }];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <aside
        aria-label="测试版本说明"
        className="border-b border-primary-foreground/20 bg-primary px-4 py-2 text-primary-foreground"
      >
        <p className="mx-auto max-w-7xl text-center text-xs leading-relaxed sm:text-sm">
          <strong className="font-semibold">测试预览版：</strong>
          城市、价格、成员和帖子均为演示数据，不代表学校或真实用户，请勿据此办理申请、签证或作出生活决策。
          <span className="mt-0.5 block text-[11px] opacity-85 sm:mt-0 sm:text-xs">
            Test preview: all information, profiles and community activity are demo data.
          </span>
        </p>
      </aside>
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-[#7d3b2e] text-lg font-bold text-primary-foreground shadow-sm">
            好
          </span>
          <span className="hidden leading-tight sm:block">
            <span className="block text-sm font-semibold tracking-tight">你好校园</span>
            <span className="block text-[11px] text-muted-foreground">NihaoCampus</span>
          </span>
        </Link>

        <nav className="ml-2 flex items-center gap-1 text-sm">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-1.5 text-muted-foreground transition hover:bg-accent hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto">
          <AuthMenu />
        </div>
      </div>
    </header>
  );
}
