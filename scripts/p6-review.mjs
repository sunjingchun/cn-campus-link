#!/usr/bin/env node
/**
 * Review artifacts. Stacks lane 2 + lane 9 into one PNG. Records the 30-60s walkthrough.
 *
 *   CHROME_PATH=... VERIFY_BASE=http://127.0.0.1:41739 node scripts/p6-review.mjs
 */

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import puppeteer from "puppeteer-core";

const HEAD = process.env.VERIFY_BASE ?? "http://127.0.0.1:41739";
const CAMPUS = "/campus/nuaa-jiangning";
const CHROME =
  process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const MEDIA = path.join(process.cwd(), "docs", "media");
const LANE2 = "/tmp/swarm-p6/worker-2/nine-marks-anonymous.png";
const LANE9 = "/tmp/swarm-p6/worker-9/empty-state-invites.png";

const settle = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function stackShots(browser) {
  const a = fs.readFileSync(LANE2).toString("base64");
  const b = fs.readFileSync(LANE9).toString("base64");
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
  const dest = path.join(MEDIA, "p6-review-mark-and-empty.png");
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
  const client = await page.createCDPSession();
  const frames = [];
  client.on("Page.screencastFrame", async ({ data, sessionId, metadata }) => {
    frames.push({ data, ts: metadata.timestamp });
    await client.send("Page.screencastFrameAck", { sessionId });
  });
  await client.send("Page.startScreencast", { format: "jpeg", quality: 70, everyNthFrame: 1 });

  await page.goto(`${HEAD}${CAMPUS}`, { waitUntil: "networkidle0", timeout: 90_000 });
  await settle(1500);
  await reveal(page, "[data-progress-ring]");
  await settle(1500);
  const expected = ["1 / 9", "2 / 9", "3 / 9"];
  for (const [index, step] of ["registration", "tempResidence", "healthCheck"].entries()) {
    await reveal(page, `[data-step-mark="${step}"]`);
    await markStep(page, step);
    await page.waitForFunction(
      (text) => document.querySelector("[data-progress-ring]")?.textContent?.trim() === text,
      { timeout: 5000 },
      expected[index],
    );
    await settle(3500);
  }
  await reveal(page, "[data-leave-note]");
  await page.evaluate(() => document.querySelector("[data-leave-note]")?.click());
  await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
  await settle(2500);
  await page.evaluate(() => {
    const action = [...document.querySelectorAll('[role="dialog"] button')].find((n) =>
      /Create one|注册一个/.test(n.textContent ?? ""),
    );
    action?.click();
  });
  await page.waitForSelector("[data-register-form]", { timeout: 5000 });
  await settle(1500);
  const email = `review_${Date.now()}@example.com`;
  await page.evaluate((addr) => {
    const form = document.querySelector("[data-register-form]");
    const inputs = [...form.querySelectorAll("input")];
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
    setter.call(inputs[0], "Review Walker");
    inputs[0].dispatchEvent(new Event("input", { bubbles: true }));
    setter.call(inputs[1], addr);
    inputs[1].dispatchEvent(new Event("input", { bubbles: true }));
    setter.call(inputs[2], "verify-password");
    inputs[2].dispatchEvent(new Event("input", { bubbles: true }));
    form.requestSubmit();
  }, email);
  await page.waitForFunction(
    () => document.querySelector("[data-progress-ring]")?.textContent?.trim() === "3 / 9" && !document.querySelector('[role="dialog"]'),
    { timeout: 8000 },
  );
  await reveal(page, "[data-progress-ring]");
  await settle(2000);
  await reveal(page, "[data-leave-note]");
  await page.evaluate(() => {
    const box = document.querySelector("[data-note-body]");
    const button = document.querySelector("[data-leave-note]");
    const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value").set;
    setter.call(box, "CIE on the first floor closed at 16:30 when I arrived.");
    box.dispatchEvent(new Event("input", { bubbles: true }));
    button.click();
  });
  await page.waitForSelector("[data-note-author]", { timeout: 8000 });
  await reveal(page, "[data-note-author]");
  await settle(2500);
  await page.reload({ waitUntil: "networkidle0" });
  await page.waitForFunction(
    () =>
      document.querySelector("[data-progress-ring]")?.textContent?.trim() === "3 / 9" &&
      (document.querySelector("[data-note-author]")?.textContent ?? "").includes("Review Walker"),
    { timeout: 8000 },
  );
  await reveal(page, "[data-progress-ring]");
  await settle(1500);
  await reveal(page, "[data-note-author]");
  await settle(3500);

  await client.send("Page.stopScreencast");
  await page.close();

  const dir = "/tmp/swarm-p6/review-frames";
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  frames.forEach((frame, index) => {
    fs.writeFileSync(path.join(dir, `f${String(index).padStart(4, "0")}.jpg`), Buffer.from(frame.data, "base64"));
  });
  const dest = path.join(MEDIA, "p6-review.mp4");
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
  process.exitCode = 1;
});
