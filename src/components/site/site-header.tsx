import Link from "next/link";
import { AuthMenu } from "@/components/auth/auth-menu";

const NAV = [
  { href: "/", label: "城市与校区", en: "Explore" },
  { href: "/members", label: "成员", en: "Members" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md">
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
