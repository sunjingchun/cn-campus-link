#!/usr/bin/env node
/**
 * Review artifacts. Stacks lane 1 + lane 5 into one PNG. Records the walkthrough.
 *
 *   CHROME_PATH=... VERIFY_BASE=http://127.0.0.1:41782 node scripts/p7-review.mjs
 */

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import puppeteer from "puppeteer-core";

const HEAD = process.env.VERIFY_BASE ?? "http://127.0.0.1:41782";
const CAMPUS = "/campus/nuaa-jiangning";
const CHROME =
  process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const MEDIA = path.join(process.cwd(), "docs", "media");
const LANE1 = "/tmp/swarm-p7/worker-1/robots-trunk-vs-head.png";
const LANE5 = "/tmp/swarm-p7/worker-5/launch-gate-blocks.png";

const settle = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function stackShots(browser) {
  const a = fs.readFileSync(LANE1).toString("base64");
  const b = fs.readFileSync(LANE5).toString("base64");
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 1600 });
  await page.setContent(
    `<!doctype html><html><body style="margin:0;background:#111">
      <img src="data:image/png;base64,${a}" style="display:block;width:100%">
      <img src="data:image/png;base64,${b}" style="display:block;width:100%">
    </body></html>`,
    { waitUntil: "load" },
  );
  await settle(200);
  const dest = path.join(MEDIA, "p7-review-launch-gate.png");
  await page.screenshot({ path: dest, fullPage: true });
  await page.close();
  return dest;
}

async function reveal(page, selector) {
  await page.evaluate((sel) => {
    document.querySelector(sel)?.scrollIntoView({ block: "center", behavior: "instant" });
  }, selector);
  await settle(400);
}

async function markStep(page, stepId, date = "2026-09-08") {
  return page.evaluate(
    (id, onDate) => {
      const root = document.querySelector(`[data-step-mark="${id}"]`);
      const input = root?.querySelector('input[type="date"]');
      const button = root?.querySelector("[data-mark-save]");
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
      setter.call(input, onDate);
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
      button.click();
    },
    stepId,
    date,
  );
}

async function recordWalkthrough(browser) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.setCookie({ name: "nihaocampus_locale", value: "en", url: HEAD });
  const client = await page.createCDPSession();
  const frames = [];
  client.on("Page.screencastFrame", async ({ data, sessionId, metadata }) => {
    frames.push({ data, ts: metadata.timestamp });
    await client.send("Page.screencastFrameAck", { sessionId });
  });
  await client.send("Page.startScreencast", { format: "jpeg", quality: 70, everyNthFrame: 1 });

  await page.goto(HEAD, { waitUntil: "networkidle0", timeout: 90_000 });
  await settle(6000);
  await page.goto(`${HEAD}${CAMPUS}`, { waitUntil: "networkidle0", timeout: 90_000 });
  await settle(4000);
  await reveal(page, "[data-progress-ring]");
  await settle(3000);
  await reveal(page, '[data-step-mark="registration"]');
  await markStep(page, "registration");
  await page.waitForFunction(
    (text) => document.querySelector("[data-progress-ring]")?.textContent?.trim() === text,
    { timeout: 5000 },
    "1 / 9",
  );
  await settle(4000);
  await reveal(page, '[data-step-mark="tempResidence"]');
  await markStep(page, "tempResidence");
  await page.waitForFunction(
    (text) => document.querySelector("[data-progress-ring]")?.textContent?.trim() === text,
    { timeout: 5000 },
    "2 / 9",
  );
  await settle(4000);
  await page.goto(`${HEAD}/place/jiangsu-ithc`, { waitUntil: "networkidle0", timeout: 90_000 });
  await settle(5000);
  await page.goto(`${HEAD}${CAMPUS}`, { waitUntil: "networkidle0", timeout: 90_000 });
  await settle(4000);
  await reveal(page, "[data-progress-ring]");
  await settle(3500);

  await client.send("Page.stopScreencast");
  await page.close();

  const dir = "/tmp/swarm-p7/review-frames";
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  frames.forEach((frame, index) => {
    fs.writeFileSync(path.join(dir, `f${String(index).padStart(4, "0")}.jpg`), Buffer.from(frame.data, "base64"));
  });
  const dest = path.join(MEDIA, "p7-review.mp4");
  const started = frames[0]?.ts ?? 0;
  const ended = frames.at(-1)?.ts ?? started;
  const duration = Math.max(ended - started, 1);
  const fps = frames.length / duration;
  const encoded = spawnSync(
    "ffmpeg",
    [
      "-y",
      "-framerate",
      String(fps.toFixed(2)),
      "-i",
      path.join(dir, "f%04d.jpg"),
      "-c:v",
      "libx264",
      "-pix_fmt",
      "yuv420p",
      dest,
    ],
    { encoding: "utf8" },
  );
  if (encoded.status !== 0) throw new Error(encoded.stderr || "ffmpeg failed");
  return { dest, frames: frames.length, duration };
}

async function main() {
  fs.mkdirSync(MEDIA, { recursive: true });
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
  const stacked = await stackShots(browser);
  const video = await recordWalkthrough(browser);
  await browser.close();
  console.log(JSON.stringify({ stacked, ...video }, null, 2));
  if (video.duration < 30 || video.duration > 70) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
