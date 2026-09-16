import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { EVENT_META } from "@/lib/domain";
import { loadMetrics, type FunnelStage, type MetricsSnapshot } from "@/lib/events";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ token?: string | string[] }>;
};

function oneParam(raw: string | string[] | undefined): string | undefined {
  return Array.isArray(raw) ? raw[0] : raw;
}

function pct(current: number, previous: number | undefined): string {
  if (previous === undefined) return "";
  if (previous === 0) return current === 0 ? "0%" : "—";
  return `${Math.round((current / previous) * 100)}%`;
}

function funnelLabel(stage: string): string {
  if (stage === "return_7d") return "七日内回访";
  if (stage in EVENT_META) return EVENT_META[stage as keyof typeof EVENT_META].zh;
  return stage;
}

function Block({ title, hint, children }: { title: string; hint: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border bg-card p-5 shadow-sm">
      <h2 className="text-base font-semibold tracking-tight">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{hint}</p>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function CountTable({
  rows,
  empty,
}: {
  rows: { key: string; label: string; count: number; extra?: string }[];
  empty: string;
}) {
  if (rows.length === 0) {
    return <p className="text-sm tabular-nums text-muted-foreground">{empty}</p>;
  }
  return (
    <table className="w-full text-sm">
      <tbody>
        {rows.map((row) => (
          <tr key={row.key} className="border-t first:border-t-0">
            <th className="py-2 pr-3 text-left font-medium">{row.label}</th>
            <td className="py-2 text-right tabular-nums">{row.count}</td>
            {row.extra ? <td className="w-16 py-2 pl-3 text-right tabular-nums text-muted-foreground">{row.extra}</td> : null}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function funnelRows(funnel: FunnelStage[]) {
  return funnel.map((stage, index) => ({
    key: stage.stage,
    label: funnelLabel(stage.stage),
    count: stage.users,
    extra: pct(stage.users, index === 0 ? undefined : funnel[index - 1]?.users),
  }));
}

function MetricsBody({ metrics }: { metrics: MetricsSnapshot }) {
  const utm = metrics.sources.filter((row) => row.kind === "utm");
  const referrers = metrics.sources.filter((row) => row.kind === "referrer");
  const copy = metrics.intent.find((row) => row.name === "copy_address")?.count ?? 0;
  const maps = metrics.intent.find((row) => row.name === "map_deeplink")?.count ?? 0;

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-10 sm:px-6">
      <header>
        <p className="text-xs font-medium tracking-widest text-muted-foreground">ADMIN</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">指标</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          只看聚合。主漏斗来自 Appendix F：campus_view → step_open → step_mark → step_done → 七日内回访。
        </p>
      </header>

      <Block title="按天的事件" hint="UTC 日期。没有数据时是空表，不是错误。">
        <CountTable
          empty="0"
          rows={metrics.daily.map((row) => ({
            key: `${row.day}-${row.name}`,
            label: `${row.day} · ${EVENT_META[row.name].zh}`,
            count: row.count,
          }))}
        />
      </Block>

      <Block title="来源与 utm" hint="utm 取 utm_source。referrer 去掉查询串。">
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <h3 className="text-xs font-medium tracking-wide text-muted-foreground">utm_source</h3>
            <CountTable
              empty="0"
              rows={utm.map((row) => ({ key: `utm-${row.value}`, label: row.value, count: row.count }))}
            />
          </div>
          <div>
            <h3 className="text-xs font-medium tracking-wide text-muted-foreground">referrer</h3>
            <CountTable
              empty="0"
              rows={referrers.map((row) => ({
                key: `ref-${row.value}`,
                label: row.value,
                count: row.count,
              }))}
            />
          </div>
        </div>
      </Block>

      <Block title="主漏斗" hint="人数是去重后的 anon_id。右侧是相对上一格的比例。">
        <CountTable empty="0" rows={funnelRows(metrics.funnel)} />
      </Block>

      <Block title="他真的要去" hint="复制中文地址和打开地图深链是最直接的意图信号。">
        <CountTable
          empty="0"
          rows={[
            { key: "copy_address", label: EVENT_META.copy_address.zh, count: copy },
            { key: "map_deeplink", label: EVENT_META.map_deeplink.zh, count: maps },
          ]}
        />
      </Block>
    </div>
  );
}

export default async function MetricsPage({ searchParams }: PageProps) {
  const expected = process.env.NIHAOCAMPUS_ADMIN_TOKEN;
  const token = oneParam((await searchParams).token);
  if (!expected || token !== expected) notFound();

  const metrics = loadMetrics();
  return <MetricsBody metrics={metrics} />;
}
