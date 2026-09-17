/**
 * Locale audit. Walks rendered HTML the same way as docs/probes/measure-lang.mjs,
 * then fails English pages whose unmarked CJK-only runs are 12% or more of all
 * text runs. Leftover CJK must sit inside `[data-cjk-intentional]` (addresses).
 *
 *   npm run audit:locale
 *   VERIFY_BASE=http://127.0.0.1:41729 npm run audit:locale
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

const CJK = /[\u4e00-\u9fff\u3400-\u4dbf]/;
const LATIN = /[A-Za-z]{3,}/;
const EN_SHARE_MAX = 0.12;

type Run = { text: string; intentional: boolean };

function decode(html: string): string {
  return html
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

export function textRuns(html: string): Run[] {
  const stripped = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ");
  const tokens = stripped.split(/(<[^>]+>)/);
  const stack = [false];
  const runs: Run[] = [];
  for (const token of tokens) {
    if (!token) continue;
    if (token.startsWith("<")) {
      const selfClosing = /\/\s*>$/.test(token) || /^<(?:br|hr|img|input|meta|link|source|area|col|embed|wbr)\b/i.test(token);
      if (token.startsWith("</")) {
        if (stack.length > 1) stack.pop();
      } else if (!selfClosing) {
        stack.push(/data-cjk-intentional/i.test(token) || stack[stack.length - 1] === true);
      }
      continue;
    }
    const text = decode(token).trim();
    if (text.length === 0) continue;
    if (/^[\s\p{P}\p{S}\d]+$/u.test(text)) continue;
    runs.push({ text, intentional: stack[stack.length - 1] === true });
  }
  return runs;
}

export function measure(html: string) {
  const runs = textRuns(html);
  let cjkOnly = 0;
  let unmarked = 0;
  let mixed = 0;
  let latinOnly = 0;
  const leftover: string[] = [];
  const unmarkedSamples: string[] = [];
  for (const run of runs) {
    const hasCjk = CJK.test(run.text);
    const hasLatin = LATIN.test(run.text);
    if (hasCjk && !hasLatin) {
      cjkOnly += 1;
      if (run.intentional) leftover.push(run.text);
      else {
        unmarked += 1;
        if (unmarkedSamples.length < 12) unmarkedSamples.push(run.text.slice(0, 80));
      }
    } else if (hasCjk) mixed += 1;
    else if (hasLatin) latinOnly += 1;
  }
  const total = cjkOnly + mixed + latinOnly;
  const share = total === 0 ? 0 : unmarked / total;
  return { total, cjkOnly, unmarked, mixed, latinOnly, share, leftover, unmarkedSamples };
}

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

function selfTest(): void {
  const chinese = "<html><body><h1>南京仙林校区落地清单</h1><p>居留许可要在入境后三十天内办完。</p></body></html>";
  const bilingual = `<html lang="en"><body>
    <h1>Landing checklist</h1>
    <p>Finish the residence permit within 30 days of entry.</p>
    <p data-cjk-intentional>南京市栖霞区仙林大道 163 号</p>
  </body></html>`;
  const zh = measure(chinese);
  const en = measure(bilingual);
  if (zh.share < EN_SHARE_MAX) fail(`self-test: pure Chinese page should fail, share=${zh.share}`);
  if (en.share >= EN_SHARE_MAX) fail(`self-test: bilingual page should pass, share=${en.share}`);
  if (en.unmarked !== 0) fail(`self-test: bilingual leftover should be marked, unmarked=${en.unmarked}`);
  if (en.leftover.length !== 1) fail(`self-test: expected one intentional address, got ${en.leftover.length}`);
  console.log("self-test: pure Chinese fails, bilingual with marked address passes");
}

async function fetchPage(base: string, path: string, locale: "en" | "zh"): Promise<string> {
  const response = await fetch(`${base}${path}`, {
    headers: { cookie: `nihaocampus_locale=${locale}` },
  });
  if (!response.ok) fail(`GET ${path} → ${response.status}`);
  return response.text();
}

async function liveAudit(base: string): Promise<void> {
  const pages = ["/", "/city/nanjing", "/campus/nju-xianlin", "/campus/nuaa-jiangning", "/place/jiangsu-ithc"];
  let failed = false;
  for (const path of pages) {
    const html = await fetchPage(base, path, "en");
    const result = measure(html);
    const pct = `${(result.share * 100).toFixed(1)}%`;
    console.log(
      `en ${path}  runs=${result.total}  unmarked-cjk=${result.unmarked} (${pct})  marked=${result.leftover.length}`,
    );
    if (result.share >= EN_SHARE_MAX || result.unmarked > 0) {
      failed = true;
      for (const sample of result.unmarkedSamples) console.log(`  unmarked: ${sample}`);
    }
    if (result.leftover.length > 0) {
      console.log(`  leftover (intentional): ${result.leftover.slice(0, 4).join(" | ")}`);
    }
  }
  if (failed) fail("audit:locale failed on live English pages");
  console.log("live English pages: unmarked CJK-only share under 12%");
}

const args = process.argv.slice(2);
if (args.includes("--dump-fixture")) {
  const dir = join(tmpdir(), "nihaocampus-locale");
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "zh.html"), "<p>纯中文段落</p>");
}

selfTest();

const base = process.env.VERIFY_BASE;
if (base) {
  await liveAudit(base.replace(/\/$/, ""));
} else {
  console.log("VERIFY_BASE unset; skipped live pages");
}
