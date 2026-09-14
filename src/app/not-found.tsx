import { ArrowRight, Compass } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CITIES } from "@/data";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center sm:px-6">
      <span className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
        <Compass className="size-6" aria-hidden />
      </span>
      <p className="mt-6 text-xs font-medium tracking-widest text-muted-foreground">404</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">这个页面不在地图上</h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        可能是链接打错了，也可能是这个城市或校区还没写完。
        <br />
        This page is not on the map yet. The city or campus may still be being written.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-2">
        <Button size="lg" nativeButton={false} render={<Link href="/" />}>
          回到城市与校区
          <ArrowRight />
        </Button>
      </div>
      {CITIES.length > 0 ? (
        <div className="mt-10">
          <p className="text-xs text-muted-foreground">已收录的城市 · Cities so far</p>
          <ul className="mt-2 flex flex-wrap justify-center gap-2">
            {CITIES.map((city) => (
              <li key={city.slug}>
                <Link
                  href={`/city/${city.slug}`}
                  className="inline-block rounded-full border bg-card px-3 py-1 text-sm transition-colors hover:border-primary/50 hover:text-primary"
                >
                  {city.name} {city.nameEn}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
