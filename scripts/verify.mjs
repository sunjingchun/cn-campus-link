#!/usr/bin/env node
/**
 * End-to-end check against a running server.
 *
 *   NIHAOCAMPUS_SEED_DEMO=1 npm run dev    # in one terminal
 *   npm run verify                         # in another
 *
 * Walks the paths a real visitor walks: the public pages, registering,
 * posting, replying, and editing a profile. Creates one throwaway account
 * and deletes it at the end. The server must be started with the same flag
 * or the demo-account assertions fail.
 */

import Database from "better-sqlite3";
import path from "node:path";

process.env.NIHAOCAMPUS_SEED_DEMO = "1";

const BASE = process.env.VERIFY_BASE ?? "http://127.0.0.1:41729";
const DB_PATH = process.env.NIHAOCAMPUS_DB ?? path.join(process.cwd(), ".data", "nihaocampus.db");
const ACCOUNT = `verify_${Date.now().toString(36)}`.slice(0, 20);

let cookie = "";
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

async function call(method, route, body) {
  const response = await fetch(`${BASE}${route}`, {
    method,
    headers: {
      ...(body ? { "content-type": "application/json" } : {}),
      ...(cookie ? { cookie } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    redirect: "manual",
  });
  const setCookie = response.headers.getSetCookie?.() ?? [];
  for (const raw of setCookie) {
    const pair = raw.split(";")[0];
    if (pair.startsWith("nhc_session=")) cookie = pair;
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

  console.log("\nregistration and validation");
  const shortPassword = await call("POST", "/api/auth/register", {
    username: `${ACCOUNT}x`,
    email: `${ACCOUNT}x@example.com`,
    password: "123",
    displayName: "太短",
    country: "TH",
    campus: null,
    status: "incoming",
  });
  check("a 3-character password is rejected", shortPassword.status === 400, shortPassword.text);

  const registered = await call("POST", "/api/auth/register", {
    username: ACCOUNT,
    email: `${ACCOUNT}@example.com`,
    password: "verify-password",
    displayName: "Verification Bot",
    country: "TH",
    campus: "nju-xianlin",
    status: "incoming",
  });
  check("register returns the new member", registered.status === 200, registered.text.slice(0, 160));
  check("register sets a session cookie", cookie.startsWith("nhc_session="));

  const duplicate = await call("POST", "/api/auth/register", {
    username: ACCOUNT,
    email: `other-${ACCOUNT}@example.com`,
    password: "verify-password",
    displayName: "Duplicate",
    country: "TH",
    campus: null,
    status: "incoming",
  });
  check("a duplicate username is rejected", duplicate.status === 409, duplicate.text);

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
  cookie = "";
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
  check("login sets a session cookie", cookie.startsWith("nhc_session="));

  cleanup();

  console.log(`\n${passed} passed, ${failures.length} failed`);
  if (failures.length > 0) {
    for (const failure of failures) console.log(`  - ${failure}`);
    process.exitCode = 1;
  }
}

function cleanup() {
  const db = new Database(DB_PATH);
  const user = db.prepare("SELECT id FROM users WHERE username = ?").get(ACCOUNT);
  if (user) db.prepare("DELETE FROM users WHERE id = ?").run(user.id);
  db.close();
}

main().catch((error) => {
  console.error(error);
  cleanup();
  process.exitCode = 1;
});
