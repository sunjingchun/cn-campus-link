import Link from "next/link";
import { SPOT_META, type PlaceSlug } from "@/lib/domain";
import { backlinksFor } from "@/data";

export function Backlinks({ slug }: { slug: PlaceSlug }) {
  const links = backlinksFor(slug);

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-sm font-medium">落地清单里的这一步</h2>
        {links.landing.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">没有落地步骤指向这里。</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {links.landing.map((item) => (
              <li key={`${item.campusSlug}-${item.step}`}>
                <Link
                  href={`/campus/${item.campusSlug}#landing-${item.step}`}
                  className="text-sm underline decoration-dotted underline-offset-4 hover:text-primary"
                >
                  第 {item.stepIndex} 步 {item.stepZh} · {item.campusLabel}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-sm font-medium">校区周边</h2>
        {links.spots.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">没有校区把这里写进周边。</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {links.spots.map((item) => (
              <li key={`${item.campusSlug}-${item.category}`}>
                <Link
                  href={`/campus/${item.campusSlug}#spots`}
                  className="text-sm underline decoration-dotted underline-offset-4 hover:text-primary"
                >
                  {item.campusLabel} · {SPOT_META[item.category].zh}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-sm font-medium">经验</h2>
        <p className="mt-2 text-sm text-muted-foreground">还没有人在这里留下经验。</p>
      </section>

      <section>
        <h2 className="text-sm font-medium">事件</h2>
        <p className="mt-2 text-sm text-muted-foreground">还没有事件绑在这个地点。</p>
      </section>
    </div>
  );
}
