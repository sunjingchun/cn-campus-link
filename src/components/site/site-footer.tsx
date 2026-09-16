import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border/70 bg-secondary/40">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[2fr_1fr_1fr]">
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-[#7d3b2e] text-base font-bold text-primary-foreground">
              好
            </span>
            <span className="text-sm font-semibold">你好校园 NihaoCampus</span>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
            本站当前处于测试阶段。城市、校区、价格、成员与帖子均为演示数据，不代表学校、机构或真实用户。
          </p>
          <p className="max-w-md text-xs leading-relaxed text-muted-foreground">
            演示内容可能不准确或已过时。办签证、居留许可等事项，请以学校国际处和当地出入境管理部门发布的信息为准。
          </p>
        </div>
        <div className="space-y-2 text-sm">
          <p className="font-medium">逛一逛</p>
          <Link href="/" className="block text-muted-foreground hover:text-foreground">
            城市与校区
          </Link>
          <Link href="/members" className="block text-muted-foreground hover:text-foreground">
            成员目录
          </Link>
          <Link
            href="/campus/nju-xianlin"
            className="block text-muted-foreground hover:text-foreground"
          >
            南大仙林校区
          </Link>
        </div>
        <div className="space-y-2 text-sm">
          <p className="font-medium">关于</p>
          <p className="text-muted-foreground">示例城市：南京</p>
          <p className="text-muted-foreground">内容语言：中文 / English</p>
        </div>
      </div>
    </footer>
  );
}
