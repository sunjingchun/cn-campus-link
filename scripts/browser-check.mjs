#!/usr/bin/env node
/**
 * Drives a real Chrome against a running server and asserts the things a fetch
 * cannot see: that the grid toggle re-renders, that search filters, that the
 * community tabs switch, and that the sign-in sheet opens.
 *
 *   npm run build && npm start
 *   npm run check:browser
 *
 * Point it at `next dev` only if HMR websockets work on your machine. Next
 * opens the HMR socket before it awaits the RSC payload, so a sandbox that
 * blocks websocket upgrades leaves every dev page server-rendered but never
 * hydrated — which looks exactly like broken product code.
 */

import { mkdirSync } from "node:fs";

import puppeteer from "puppeteer-core";

const BASE = process.env.VERIFY_BASE ?? "http://127.0.0.1:41729";
const CHROME = process.env.CHROME_PATH ?? "/usr/local/bin/google-chrome";
const SHOTS = process.env.SHOT_DIR ?? "/tmp/nihaocampus-shots";

// The run writes screenshots here; on a fresh machine the directory does not
// exist yet, and page.screenshot() would throw ENOENT before the first check.
mkdirSync(SHOTS, { recursive: true });

let passed = 0;
const failures = [];

function check(name, ok, detail = "") {
  if (ok) {
    passed += 1;
    console.log(`  ok   ${name}`);
  } else {
    failures.push(`${name}${detail ? ` — ${detail}` : ""}`);
    console.log(`  FAIL ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

const settle = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

async function clickText(page, text, scope = "button,a,[role=tab]") {
  const handle = await page.evaluateHandle(
    (t, s) => {
      const nodes = [...document.querySelectorAll(s)];
      return nodes.find((n) => (n.textContent ?? "").trim() === t) ?? null;
    },
    text,
    scope,
  );
  const element = handle.asElement();
  if (!element) return false;
  await element.click();
  await settle();
  return true;
}

/** The grid publishes its own result count in a live region; trust that over counting nodes. */
const resultLine = (page) =>
  page.evaluate(() => {
    const node = document.querySelector('[aria-live="polite"]');
    return node ? (node.textContent ?? "").replace(/\s+/g, " ").trim() : "absent";
  });

const resultCount = async (page) => {
  const line = await resultLine(page);
  const match = line.match(/(\d+)\s*个/);
  return match ? Number(match[1]) : -1;
};

const setSearch = (page, value) =>
  page.evaluate((v) => {
    const input = document.querySelector('input[type="search"], input[type="text"], input:not([type])');
    if (!input) return false;
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
    setter.call(input, v);
    input.dispatchEvent(new Event("input", { bubbles: true }));
    return true;
  }, value);

const selectedTab = (page) =>
  page.evaluate(() => {
    const tab = [...document.querySelectorAll('[role="tab"]')].find(
      (n) => n.getAttribute("aria-selected") === "true",
    );
    return tab ? (tab.textContent ?? "").trim() : "none";
  });

const bodyHas = (page, text) =>
  page.evaluate((t) => (document.body.innerText ?? "").includes(t), text);

let browser;

async function main() {
  browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
  await browser
    .defaultBrowserContext()
    .overridePermissions(BASE, ["clipboard-read", "clipboard-write"]);
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1000 });

  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.evaluateOnNewDocument(() => {
    window.__caught = [];
    addEventListener("unhandledrejection", (e) => window.__caught.push(String(e.reason)));

    // Headless Chrome denies clipboard writes even with the permission
    // overridden, so stand in for the OS clipboard. What we assert is ours:
    // the text the component hands over, and how it reports both outcomes.
    window.__copied = [];
    window.__copyFails = false;
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: (text) => {
          if (window.__copyFails) return Promise.reject(new Error("denied"));
          window.__copied.push(text);
          return Promise.resolve();
        },
        readText: () => Promise.resolve(window.__copied.at(-1) ?? ""),
      },
    });
  });

  console.log(`Browser checks against ${BASE}\n`);

  console.log("hydration");
  await page.goto(`${BASE}/`, { waitUntil: "networkidle0", timeout: 90_000 });
  await settle(800);
  check(
    "React hydrates the page",
    await page.evaluate(() => {
      const node = document.querySelector("button");
      return node ? Object.keys(node).some((k) => k.startsWith("__react")) : false;
    }),
  );

  console.log("\nhome grid");
  const cityCount = await resultCount(page);
  check("the grid reports a city count", cityCount >= 6, `line: ${await resultLine(page)}`);
  await page.screenshot({ path: `${SHOTS}/home.png` });

  const toggled = await page.evaluate(() => {
    const button = [...document.querySelectorAll('[role="group"] button')].find((n) =>
      (n.textContent ?? "").startsWith("按校区"),
    );
    button?.click();
    return Boolean(button);
  });
  await settle(600);
  check("the 按校区 toggle is present", toggled);
  const campusCount = await resultCount(page);
  check(
    "the toggle swaps the grid to campuses",
    campusCount >= 16 && (await resultLine(page)).includes("校区"),
    `line: ${await resultLine(page)}`,
  );

  check("the search box takes input", await setSearch(page, "南大"));
  await settle(600);
  const narrowed = await resultCount(page);
  check("search narrows the grid", narrowed > 0 && narrowed < campusCount, `now ${narrowed}`);

  await setSearch(page, "zzzznotacampus");
  await settle(600);
  check("no match shows the empty state", await bodyHas(page, "没有符合这些条件的"));
  check("the empty state offers a way back", await bodyHas(page, "清除全部筛选"));
  await page.screenshot({ path: `${SHOTS}/home-empty.png` });
  check("清除全部筛选 restores the grid", await clickText(page, "清除全部筛选"));
  await settle(600);
  check("the grid comes back", (await resultCount(page)) >= 16, `now ${await resultCount(page)}`);

  console.log("\ncampus page");
  await page.goto(`${BASE}/campus/nju-xianlin`, { waitUntil: "networkidle0", timeout: 90_000 });
  await settle(600);
  check("the landing checklist renders", await bodyHas(page, "居留许可"));
  await page.screenshot({ path: `${SHOTS}/campus.png` });

  console.log("\ncopying an address for a driver");
  /** Clicks the first copy button and reports the place it belongs to. */
  const clickCopy = () =>
    page.evaluate(() => {
      const button = [...document.querySelectorAll("button")].find((n) =>
        (n.textContent ?? "").includes("复制中文地址"),
      );
      if (!button) return null;
      const lines = [...(button.closest("div.rounded-xl")?.querySelectorAll("p") ?? [])].map((n) =>
        (n.textContent ?? "").trim(),
      );
      button.click();
      return { name: lines[0] ?? "", address: lines[2] ?? "" };
    });
  const copyLabels = () =>
    page.evaluate(() => [...document.querySelectorAll("button")].map((n) => (n.textContent ?? "").trim()));

  const place = await clickCopy();
  check("the copy button is on the page", place !== null);
  await settle(700);
  check("the button confirms the copy", (await copyLabels()).includes("已复制"));
  const copied = await page.evaluate(() => window.__copied.at(-1) ?? "");
  check(
    "it hands over exactly the Chinese name and address shown on the page",
    place !== null && copied === `${place.name} ${place.address}` && place.name.length > 0,
    `copied ${JSON.stringify(copied)} vs shown ${JSON.stringify(`${place?.name} ${place?.address}`)}`,
  );
  await settle(1600);
  check(
    "the button goes back to its label",
    (await copyLabels()).some((label) => label.includes("复制中文地址")),
  );

  await page.evaluate(() => {
    window.__copyFails = true;
  });
  await clickCopy();
  await settle(700);
  check("a denied clipboard says so instead of claiming success", await bodyHas(page, "复制失败"));
  check("a denied clipboard leaves the button alone", !(await copyLabels()).includes("已复制"));
  await page.evaluate(() => {
    window.__copyFails = false;
  });

  console.log("\ncommunity tabs, signed out");
  check("the board tab starts selected", (await selectedTab(page)) === "留言板");
  await clickText(page, "聊天室");
  check("the 聊天室 tab switches", (await selectedTab(page)) === "聊天室");
  check("the chat gate replaces the transcript", await bodyHas(page, "聊天室只对成员开放"));
  check(
    "the gate reports real room activity rather than fake messages",
    await page.evaluate(() =>
      /这个房间(已经有\s*\d+\s*条消息|还没有人说话)/.test(document.body.innerText ?? ""),
    ),
  );
  await page.screenshot({ path: `${SHOTS}/chat-gate.png` });
  await clickText(page, "在这里的人");
  check("the 在这里的人 tab switches", (await selectedTab(page)) === "在这里的人");

  console.log("\nsign-in sheet");
  check("the header 登录 button opens the sheet", (await clickText(page, "登录")) && (await page.evaluate(() => document.querySelectorAll('[role="dialog"]').length > 0)));
  check("the sheet is the sign-in form", await bodyHas(page, "登录 NihaoCampus"));
  await page.screenshot({ path: `${SHOTS}/sign-in.png` });

  await page.evaluate(() => {
    const inputs = [...document.querySelectorAll('[role="dialog"] input')];
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
    setter.call(inputs[0], "amina_k");
    inputs[0].dispatchEvent(new Event("input", { bubbles: true }));
    setter.call(inputs[1], "nihaocampus");
    inputs[1].dispatchEvent(new Event("input", { bubbles: true }));
  });
  await page.evaluate(() => {
    const submit = [...document.querySelectorAll('[role="dialog"] button')].find(
      (n) => (n.textContent ?? "").trim() === "登录",
    );
    submit?.click();
  });
  await settle(3000);
  check("signing in closes the sheet", await page.evaluate(() => document.querySelectorAll('[role="dialog"]').length === 0));
  check("the header switches to the member menu", !(await bodyHas(page, "加入")) || (await bodyHas(page, "Amina")));

  console.log("\nchat, signed in");
  await page.goto(`${BASE}/campus/nju-xianlin`, { waitUntil: "networkidle0", timeout: 90_000 });
  await settle(600);
  await clickText(page, "聊天室");
  check("the gate is gone once signed in", !(await bodyHas(page, "聊天室只对成员开放")));
  check("the transcript is readable", await bodyHas(page, "图书馆"));
  await page.screenshot({ path: `${SHOTS}/chat-signed-in.png` });

  console.log("\nmobile");
  await page.setViewport({ width: 390, height: 844 });
  for (const path of ["/", "/city/nanjing", "/campus/nju-xianlin", "/members"]) {
    await page.goto(`${BASE}${path}`, { waitUntil: "networkidle0", timeout: 90_000 });
    await settle(400);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    check(`${path} does not scroll sideways at 390px`, overflow <= 1, `overflow ${overflow}px`);
  }
  await page.screenshot({ path: `${SHOTS}/home-mobile.png` });

  console.log("\nreduced motion");
  await page.setViewport({ width: 1440, height: 1000 });
  await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
  await page.goto(`${BASE}/`, { waitUntil: "networkidle0", timeout: 90_000 });
  await settle(500);
  const animations = await page.evaluate(() =>
    [...document.querySelectorAll(".animate-drift, .animate-rise-in, .animate-live-pulse, .animate-marquee")]
      .map((node) => getComputedStyle(node).animationName)
      .filter((name) => name !== "none"),
  );
  check(
    "prefers-reduced-motion stops every animation",
    animations.length === 0,
    `still running: ${[...new Set(animations)].join(", ")}`,
  );

  const rejections = await page.evaluate(() => window.__caught ?? []);
  check("no uncaught page errors", pageErrors.length === 0, pageErrors.slice(0, 2).join(" | "));
  check("no unhandled rejections", rejections.length === 0, rejections.slice(0, 2).join(" | "));

  await browser.close();

  console.log(`\n${passed} passed, ${failures.length} failed`);
  console.log(`screenshots in ${SHOTS}`);
  for (const failure of failures) console.log(`  - ${failure}`);
  if (failures.length > 0) process.exitCode = 1;
}

main().catch(async (error) => {
  console.error(error);
  process.exitCode = 1;
  // Without this, an error thrown mid-run leaves Chrome connected and node
  // hangs on the open handle instead of exiting.
  await browser?.close().catch(() => {});
});
