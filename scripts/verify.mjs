#!/usr/bin/env node
/**
 * End-to-end check against a running server.
 *
 *   NIHAOCAMPUS_SEED_DEMO=1 npm run dev    # in one terminal
 *   npm run verify                         # in another
 *
 * Walks the paths a real visitor walks: the public pages, registering,
 * posting, replying, editing a profile, posting a known event, rejecting an
 * unknown name, and the per-minute cap. The server must be started with the
 * same flag or the demo-account assertions fail.
 */

import Database from "better-sqlite3";
import path from "node:path";

process.env.NIHAOCAMPUS_SEED_DEMO = "1";

const BASE = process.env.VERIFY_BASE ?? "http://127.0.0.1:41729";
const DB_PATH = process.env.NIHAOCAMPUS_DB ?? path.join(process.cwd(), ".data", "nihaocampus.db");
const ACCOUNT = `verify_${Date.now().toString(36)}`.slice(0, 20);

const cookies = new Map();
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

function cookieHeader() {
  return [...cookies.entries()].map(([name, value]) => `${name}=${value}`).join("; ");
}

async function call(method, route, body) {
  const response = await fetch(`${BASE}${route}`, {
    method,
    headers: {
      ...(body ? { "content-type": "application/json" } : {}),
      ...(cookies.size > 0 ? { cookie: cookieHeader() } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    redirect: "manual",
  });
  const setCookie = response.headers.getSetCookie?.() ?? [];
  for (const raw of setCookie) {
    const pair = raw.split(";")[0];
    const eq = pair.indexOf("=");
    if (eq < 1) continue;
    cookies.set(pair.slice(0, eq), pair.slice(eq + 1));
  }
  const text = await response.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* html responses are checked by status and substring instead */
  }
  return { status: response.status, text, json };
}

async function main() {
  console.log(`NihaoCampus verification against ${BASE}\n`);

  console.log("public pages");
  for (const [route, needle] of [
    ["/", "你好校园"],
    ["/city/nanjing", "南京"],
    ["/campus/nju-xianlin", "仙林"],
    ["/campus/seu-jiulonghu", "九龙湖"],
    ["/place/jiangsu-ithc", "创智路 39 号"],
    ["/u/amina_k", "Amina"],
    ["/city/shanghai", ""],
    ["/settings", ""],
    ["/city/does-not-exist", ""],
  ]) {
    const expected = route === "/city/does-not-exist" || route === "/city/shanghai" ? 404 : 200;
    const result = await call("GET", route);
    check(
      `${route} → ${expected}`,
      result.status === expected && (!needle || result.text.includes(needle)),
      `got ${result.status}${needle && !result.text.includes(needle) ? `, missing "${needle}"` : ""}`,
    );
  }

  console.log("\nsigned-out gates");
  const gone = await call("GET", "/api/messages?room=campus:nju-xianlin&after=0");
  check("the chat route is gone", gone.status === 404 || gone.status === 405, `got ${gone.status}`);
  const gatedPost = await call("POST", "/api/posts", {
    room: "campus:nju-xianlin",
    category: "tip",
    title: "未登录发帖",
    body: "应该被拒绝",
  });
  check("posting is 401 while signed out", gatedPost.status === 401, `got ${gatedPost.status}`);

  console.log("\nmarks and notes");
  cookies.clear();
  const CAMPUS = "nuaa-jiangning";
  const STEP = "registration";
  const markBody = {
    campus_slug: CAMPUS,
    item_kind: "landing_step",
    item_id: STEP,
    kind: "planned",
    on_date: "2026-09-08",
  };
  const firstMark = await call("POST", "/api/marks", markBody);
  check("unsigned mark is 200", firstMark.status === 200, firstMark.text.slice(0, 160));
  check("unsigned mark writes one row", countMarksByAnon() === 1, `rows ${countMarksByAnon()}`);

  for (let i = 0; i < 5; i += 1) {
    await call("POST", "/api/marks", markBody);
  }
  check("repeat marks stay one row", countMarksByAnon() === 1, `rows ${countMarksByAnon()}`);

  const unsignedUnmark = await call("DELETE", "/api/marks", {
    campus_slug: CAMPUS,
    item_kind: "landing_step",
    item_id: STEP,
  });
  check("unsigned unmark is 200", unsignedUnmark.status === 200, unsignedUnmark.text.slice(0, 160));
  check("unsigned unmark removes the row", countMarksByAnon() === 0, `rows ${countMarksByAnon()}`);
  await call("POST", "/api/marks", markBody);
  check("re-mark after unmark is one row", countMarksByAnon() === 1, `rows ${countMarksByAnon()}`);

  const unsignedNote = await call("POST", "/api/notes", {
    campus_slug: CAMPUS,
    item_kind: "landing_step",
    item_id: STEP,
    body: "unsigned note should fail",
  });
  check("unsigned note is 401", unsignedNote.status === 401, `got ${unsignedNote.status}`);

  const badStep = await call("POST", "/api/marks", {
    campus_slug: CAMPUS,
    item_kind: "landing_step",
    item_id: "not-a-step",
    kind: "planned",
  });
  check("unknown item_id is 400", badStep.status === 400, `got ${badStep.status}`);

  const badNoteStep = await call("POST", "/api/notes", {
    campus_slug: CAMPUS,
    item_kind: "landing_step",
    item_id: "not-a-step",
    body: "should fail",
  });
  check("unknown note item_id is 400 or 401", badNoteStep.status === 400 || badNoteStep.status === 401, `got ${badNoteStep.status}`);

  console.log("\nregistration and validation");
  const shortPassword = await call("POST", "/api/auth/register", {
    email: `${ACCOUNT}x@example.com`,
    password: "123",
    displayName: "太短",
  });
  check("a 3-character password is rejected", shortPassword.status === 400, shortPassword.text);

  const registered = await call("POST", "/api/auth/register", {
    email: `${ACCOUNT}@example.com`,
    password: "verify-password",
    displayName: "Verification Bot",
  });
  check("register returns the new member", registered.status === 200, registered.text.slice(0, 160));
  check("register sets a session cookie", cookies.has("nhc_session"));
  check("register backfills mark user_id", countMarksWithUser() === 1, `backfilled ${countMarksWithUser()}`);

  const duplicate = await call("POST", "/api/auth/register", {
    email: `${ACCOUNT}@example.com`,
    password: "verify-password",
    displayName: "Duplicate",
  });
  check("a duplicate email is rejected", duplicate.status === 409, duplicate.text);

  const signedNote = await call("POST", "/api/notes", {
    campus_slug: CAMPUS,
    item_kind: "landing_step",
    item_id: STEP,
    body: "Bring the original admission letter. The window on the first floor closes at 16:30.",
  });
  check("signed note is 200", signedNote.status === 200, signedNote.text.slice(0, 160));

  const badSignedNote = await call("POST", "/api/notes", {
    campus_slug: CAMPUS,
    item_kind: "landing_step",
    item_id: "not-a-step",
    body: "should fail",
  });
  check("unknown note item_id is 400", badSignedNote.status === 400, `got ${badSignedNote.status}`);

  console.log("\nboard");
  const created = await call("POST", "/api/posts", {
    room: "campus:nju-xianlin",
    category: "question",
    title: "验证脚本发的帖子",
    body: "这条内容由 npm run verify 创建，跑完会被删掉。",
  });
  check("creating a thread succeeds", created.status === 200, created.text.slice(0, 160));
  const postId = created.json?.id ?? created.json?.postId ?? null;
  check("the created thread returns its id", typeof postId === "string" && postId.length > 0);

  if (typeof postId === "string") {
    const empty = await call("GET", `/api/posts/${postId}/replies`);
    const emptyList = empty.json?.replies ?? empty.json ?? [];
    check("a new thread has no replies", empty.status === 200 && emptyList.length === 0);

    const replied = await call("POST", `/api/posts/${postId}/replies`, { body: "验证回复" });
    check("replying succeeds", replied.status === 200, replied.text.slice(0, 160));

    const withReply = await call("GET", `/api/posts/${postId}/replies`);
    const list = withReply.json?.replies ?? withReply.json ?? [];
    check("the reply comes back", list.length === 1, `got ${list.length}`);

    const missing = await call("POST", "/api/posts/pst_missing/replies", { body: "x" });
    check("replying to a missing thread is 404", missing.status === 404, `got ${missing.status}`);
  }

  console.log("\nprofile");
  const saved = await call("PUT", "/api/profile", {
    displayName: "Verification Bot",
    country: "TH",
    campus: "nju-xianlin",
    status: "current",
    arrivalYear: 2025,
    program: "验证专业",
    level: "master",
    languages: ["ไทย", "English"],
    interests: ["回归测试"],
    bio: "这是验证脚本写入的简介。",
    links: { wechat: "verify_bot", instagram: null, email: null },
  });
  check("saving the profile succeeds", saved.status === 200, saved.text.slice(0, 160));

  const profilePage = await call("GET", `/u/${ACCOUNT}`);
  check(
    "the new bio shows on the public profile",
    profilePage.status === 200 && profilePage.text.includes("这是验证脚本写入的简介"),
    `got ${profilePage.status}`,
  );

  console.log("\nsign out and sign in");
  const out = await call("POST", "/api/auth/logout");
  check("logout succeeds", out.status === 200);
  cookies.delete("nhc_session");
  const signedOutPost = await call("POST", "/api/posts", {
    room: "campus:nju-xianlin",
    category: "tip",
    title: "登出后再发",
    body: "应该被拒绝",
  });
  check("posting is 401 after logout", signedOutPost.status === 401, `got ${signedOutPost.status}`);

  const loggedIn = await call("POST", "/api/auth/login", {
    identifier: ACCOUNT,
    password: "verify-password",
  });
  check("login returns the member", loggedIn.status === 200, loggedIn.text.slice(0, 160));
  check("login sets a session cookie", cookies.has("nhc_session"));

  console.log("\nevents");
  cookies.clear();
  const accepted = await call("POST", "/api/events", { name: "page_view", path: "/" });
  check("a known event is 204", accepted.status === 204, `got ${accepted.status}`);

  const rejected = await call("POST", "/api/events", { name: "bogus_event" });
  check("an unknown event is 400", rejected.status === 400, `got ${rejected.status}`);

  cookies.clear();
  const probePath = `/verify-rate/${ACCOUNT}`;
  let burstServerError = false;
  let burstLast = 0;
  for (let i = 0; i < 100; i += 1) {
    const burst = await call("POST", "/api/events", { name: "page_view", path: probePath });
    burstLast = burst.status;
    if (burst.status >= 500) burstServerError = true;
  }
  const stored = countEventsByPath(probePath);
  check("a burst of 100 is stored as at most 60", stored <= 60 && stored > 0, `stored ${stored}`);
  check("rate limit does not 500", !burstServerError && burstLast === 204, `last ${burstLast}`);

  cleanup();

  console.log(`\n${passed} passed, ${failures.length} failed`);
  if (failures.length > 0) {
    for (const failure of failures) console.log(`  - ${failure}`);
    process.exitCode = 1;
  }
}

function countEventsByPath(eventPath) {
  const db = new Database(DB_PATH);
  const row = db.prepare("SELECT COUNT(*) AS n FROM events WHERE path = ?").get(eventPath);
  db.close();
  return row?.n ?? 0;
}

function countMarksByAnon() {
  const anonId = cookies.get("nhc_anon");
  if (!anonId) return -1;
  const db = new Database(DB_PATH);
  const row = db.prepare("SELECT COUNT(*) AS n FROM marks WHERE anon_id = ?").get(anonId);
  db.close();
  return row?.n ?? 0;
}

function countMarksWithUser() {
  const anonId = cookies.get("nhc_anon");
  if (!anonId) return -1;
  const db = new Database(DB_PATH);
  const row = db
    .prepare("SELECT COUNT(*) AS n FROM marks WHERE anon_id = ? AND user_id IS NOT NULL")
    .get(anonId);
  db.close();
  return row?.n ?? 0;
}

function cleanup() {
  const db = new Database(DB_PATH);
  const user = db.prepare("SELECT id FROM users WHERE username = ?").get(ACCOUNT);
  const anonId = cookies.get("nhc_anon");
  db.prepare("DELETE FROM events WHERE path = ?").run(`/verify-rate/${ACCOUNT}`);
  if (anonId) db.prepare("DELETE FROM marks WHERE anon_id = ?").run(anonId);
  if (user) {
    db.prepare("DELETE FROM notes WHERE user_id = ?").run(user.id);
    db.prepare("DELETE FROM users WHERE id = ?").run(user.id);
  }
  db.close();
}

main().catch((error) => {
  console.error(error);
  cleanup();
  process.exitCode = 1;
});
