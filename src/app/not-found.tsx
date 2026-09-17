import { ArrowRight, Compass } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CITIES } from "@/data";
import { copy } from "@/lib/copy";
import { t } from "@/lib/locale";
import { readLocale } from "@/lib/read-locale";

export default async function NotFound() {
  const locale = await readLocale();
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center sm:px-6">
      <span className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
        <Compass className="size-6" aria-hidden />
      </span>
      <p className="mt-6 text-xs font-medium tracking-widest text-muted-foreground">404</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{t(copy.notFound, locale)}</h1>
      <p className="mt-3 max-w-md text-muted-foreground">{t(copy.notFoundBody, locale)}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-2">
        <Button size="lg" nativeButton={false} render={<Link href="/" />}>
          {t(copy.backHome, locale)}
          <ArrowRight />
        </Button>
      </div>
      {CITIES.length > 0 ? (
        <div className="mt-10">
          <p className="text-xs text-muted-foreground">{t(copy.listedCampuses, locale)}</p>
          <ul className="mt-2 flex flex-wrap justify-center gap-2">
            {CITIES.map((city) => (
              <li key={city.slug}>
                <Link
                  href={`/city/${city.slug}`}
                  className="inline-block rounded-full border bg-card px-3 py-1 text-sm transition-colors hover:border-primary/50 hover:text-primary"
                >
                  {t(city.name, locale)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
