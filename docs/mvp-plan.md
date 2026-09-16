# NihaoCampus MVP 上线验证方案

把 NihaoCampus 从一个模型生成的六城演示站，收缩成南航江宁校区一份可核验的落地手册，加埋点后公开上线。
面向的人是已被录取、报到前八周的留学生。内容是他来的理由，人是他回来的理由，所以第一批以内容为主。
本方案强制一条规则：页面上任何事实性声明都必须带来源，没有来源的必须显示为未核实。
PR 顺序：P1 削减、P2 地点实体化与溯源、P3 埋点、P4 英文优先、P5 南航江宁内容、P6 标一下与署名经验、P7 上线。
第二批做什么见 Appendix G，本方案不实现它，只保证数据形状容得下。

## How to read this

One box is one unit of work. Every box names the evidence that checks it. A nested box is a sub-step of the box above it. Check a box only when its evidence exists, a file, a log line, a screenshot, a test run, or a SHA. The body is a how-to. The appendices explain and record.

The program runs `pstack/skills/poteto-mode/playbooks/autopilot-stack.md`. 七个 PR 全停在 merge-ready，由 operator 自己 review 并按 P1 到 P7 自下而上落地。root 不合并任何一个。

Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

中文读法：每个方框是一件能独立验收的事。方框后面写的是验收它的证据。没有证据不要打勾。正文只讲怎么做，附录讲为什么这么做、被否掉的方案、以及第二批留了什么空间。

## Program checklist

### Arm the program

- [ ] State the protocol and this plan to the operator, then stop. Start execution only on the operator's explicit go.
- [ ] On the operator's go, arm a `/goal` with this exact text. "跑 `cn-campus-link/docs/mvp-plan.md`，执行 playbook 是 autopilot-stack。PR 顺序 P1 削减、P2 地点实体化与溯源、P3 埋点、P4 英文优先、P5 南航江宁内容、P6 标一下与署名经验、P7 上线。验收规则：unit、live、perf 三组方框全打勾才算 verified。operator 自己落地，root 不合并。done 条件是七个 PR 全部 merge-ready，且 P7 的上线门槛通过，也就是南航江宁九步全部带来源、且站上有至少 15 条署名经验覆盖至少 6 步。"
- [ ] **这个仓库没有 vendor pstack。** 下面几条的 `git show origin/main:` 形式只适用于把 skills 收进仓库的项目。在 `cn-campus-link` 里改成从插件缓存读，前缀是 `/Users/jc/.cursor/plugins/cache/cursor-public/pstack/be432a96ed36e48d05f44bf375864355f62263f9/skills/`，例如 `.../skills/poteto-mode/playbooks/autopilot-stack.md`。哈希会随插件更新变，每个 tick 用 `ls /Users/jc/.cursor/plugins/cache/cursor-public/pstack/` 重新确认一次。
- [ ] Read these from trunk at program start. Re-read them at every tick.
  - [ ] `git show origin/main:pstack/skills/poteto-mode/playbooks/autopilot-stack.md`
  - [ ] `git show origin/main:pstack/skills/swarm/SKILL.md`
  - [ ] `git show origin/main:pstack/skills/control-ui/SKILL.md`
  - [ ] `git show origin/main:pstack/skills/poteto-mode/playbooks/opening-a-pr.md`
  - [ ] `git show origin/main:pstack/skills/poteto-mode/references/bugbot-triage.md`
- [ ] Arm the 30-minute audit tick. In a local session, a real terminal `/loop`. In a cloud root, a cloud-sleeper wake chain. Never leave the cadence to memory.
- [ ] Use this tick prompt, verbatim. "Re-read the execution playbook from trunk and the armed /goal. Audit the operation against both and fix drift in this tick. Probe every active lane and judge progress by side effects only. Stand down a stuck lane and dispatch its replacement now. Then post a status message to the operator in chat, whether or not anything changed, with the queue table of PR, owner, state, and head SHA, the verdicts since the last tick, what merged, open operator gates, and blockers."
- [ ] On the operator's hold or stand-down, send every owner a zero-writes order at once.

### Spawn owners

- [ ] Spawn one owner per PR with the full lifecycle `autopilot-stack.md` names.
- [ ] Follow this dependency graph. Start dependent work only after its parent lands on the stack.
  - [ ] P1 和 P3 相互独立，最先开工。两个都从 `main` 起。
  - [ ] P2 在 P1 之后。先删掉五个假城市，地点实体化就少迁移五份。
  - [ ] P4 在 P2 之后。溯源字段本身也要双语，两次改同一批内容文件会冲突。
  - [ ] P5 在 P4 之后。南航江宁的内容必须直接按实体模型和双语模型写，否则要重写一遍。
  - [ ] P6 在 P3 和 P5 之后。标一下要发事件，署名经验要挂在南航江宁的步骤上。
  - [ ] P7 在全部之后。
- [ ] Hold the file boundaries. P1 与 P4 与 P5 只碰 `src/data/**` 与 `src/lib/domain.ts`。P2 额外碰 `src/app/place/**`。P3 与 P6 只碰 `src/lib/db.ts`、`src/lib/store.ts`、`src/app/api/**`。P7 只碰 `scripts/**`、`next.config.ts`、`src/app/layout.tsx`、`src/app/robots.ts`。
- [ ] Hold the review gate. P1、P2、P4、P6、P7 改动交互或改动读者看到的事实，必须先在 chat 里给 operator 看截图和录屏才能进栈。

### PR mechanics, for every PR

- [ ] Resolve the forge once. Default to `gh`; if `command -v origin` succeeds and Origin can resolve the repository, use `origin pr` for every PR operation. Record any fallback to `gh`. Never require `gt`.
- [ ] Open the PR ready, never draft, with `origin pr create --status open --base <base-branch>` or `gh pr create --base <base-branch>` according to the resolved forge. A stack child targets its parent branch.
- [ ] 每次 PR 前推之前跑 `npm run typecheck` 与 `npm run lint`。Push with hooks on。
- [ ] Run `/deslop` before each commit and `/no-comments` before review.
- [ ] Triage every Bugbot and security-reviewer comment per `pstack/skills/poteto-mode/references/bugbot-triage.md`.
- [ ] Rebase onto current trunk before babysit and again before the merge-ready report.
- [ ] **内容纪律。任何 owner 不得写入自己没有来源的事实。** 需要一条事实而手上没有来源时，写 `sources: []` 并在报告里列出来，交给 operator 去核。编造一个看起来合理的值是这个方案要消除的那个缺陷本身。

### Verdict and merge, for every PR

- [ ] At the merge-ready head SHA, run the swarm per `pstack/skills/swarm/SKILL.md`. One gates lane. The ten live lanes from the PR's **Verify, live** block. The perf lane from its **Verify, perf** block. One audit lane that reads the diff and the receipts and distrusts the PR body.
- [ ] 内容类 PR（P1、P4、P5）额外加一条 lane，它随机抽 5 条事实性断言，独立去访问 `sources` 里的 URL，核对页面上的值和来源页上的值一致。任何一条不一致就是 fail。
- [ ] Clean only when every lane is `PASS`. Findings go back to the owner. A new head gets a fresh swarm and a fresh verdict.
- [ ] Root 拿到干净 verdict 后把该 PR 追加到唯一一条线性 base-branch 栈上，rebase 到父分支 tip，比对 `git patch-id` 未变，然后由 operator 自下而上落地。No owner merges.

### Boot recipe, for every live lane

Each live lane runs at the PR head. Drive the browser through `control-ui` from `cursor-team-kit`. 这个仓库已有 `puppeteer-core` 和 `scripts/browser-check.mjs`，lane 复用同一套驱动，不需要云 VM。

- [ ] `git fetch origin <head-branch> && git checkout <head SHA>`.
- [ ] `npm ci && npm run build && npm start`，等 `http://localhost:41729` 返回 200。**必须跑生产构建**，`next dev` 在禁 WebSocket 的沙箱里永远不 hydrate，会把环境问题误报成功能坏了。
- [ ] Deliver input only through `control-ui` commands. 只读诊断用 `browser_snapshot` 与 CDP `Runtime.evaluate`。
- [ ] Save every screenshot to `/tmp/swarm-<pr-id>/worker-<n>/<slug>.png` and return the paths with the report.

## 削减到南京一城并移除低密度社交面 (P1)

**Depends on.** None. 从 `main` 起。

**Files.**

- [ ] Delete `src/data/cities/beijing.ts`、`shanghai.ts`、`hangzhou.ts`、`chengdu.ts`、`xian.ts`。
- [ ] Edit `src/data/index.ts`，`CITY_PACKS` 只留 `nanjing`。
- [ ] Delete `src/components/social/chat-room.tsx`、`src/app/api/messages/route.ts`。
- [ ] Delete `src/app/members/page.tsx`、`src/components/member/members-directory.tsx`、`src/components/social/people-panel.tsx`。
- [ ] Edit `src/lib/db.ts`，删掉 `messages` 表与 `idx_messages_room`。
- [ ] Edit `src/lib/store.ts`，删掉 `listMessages`、`createMessage`、`countMessagesByRoom`、`roomPulse`、`listMembers`、`countMembersByCampus`。
- [ ] Edit `src/lib/seed.ts`，演示数据改成只在 `NIHAOCAMPUS_SEED_DEMO` 为 `1` 时才灌。
- [ ] Edit `src/app/layout.tsx`，`ensureSeed` 调用受同一个开关控制。
- [ ] Edit `src/lib/store.ts` 的 `communityStats`，不再把演示账号算进成员数。
- [ ] Edit `README.md`，演示密码那段改成说明开关，不再在生产语境里公示口令。
- [ ] Edit `scripts/verify.mjs`、`scripts/browser-check.mjs`，显式带上开关。
- [ ] Edit `src/components/social/community-tabs.tsx`、`src/components/site/site-header.tsx`，去掉聊天与成员目录入口。

**Build.**

- [ ] 先备份线上库。`ssh reports-vps 'sqlite3 /var/www/nihaocampus/.data/nihaocampus.db ".backup /root/nihaocampus-preP1.db"'`，再用 `sqlite3` 查 `messages`、`posts`、`users` 的行数并抄进报告，确认没有真实用户数据再动 schema。
- [ ] 删五个城市文件，改 `CITY_PACKS`，让 `src/data/index.ts` 的 Map 只构建南京。
- [ ] 删聊天室组件与 `messages` 相关的 store 函数和表，`community-tabs.tsx` 只留留言板一个 tab。
- [ ] 删成员目录与成员墙，`site-header.tsx` 去掉 `/members` 链接。
- [ ] **生产环境一个演示账号都不要。** `ensureSeed` 与 `seed.ts` 的灌入路径都受 `NIHAOCAMPUS_SEED_DEMO` 控制，缺省不灌。两个原因。`users` 表没有 `is_demo` 列，所以留任何一个演示账号都会让真人注册在数据层面不可区分，Appendix F 里「有多少人真的注册了」这一格就失效。而且 `README.md` 公示了共用密码 `nihaocampus`，`ensureSeed` 又在 `layout.tsx:47` 每次请求都跑，任何拿到 URL 的人现在都能登进那些账号发帖。
- [ ] `communityStats` 现在扫全表（`store.ts:345`），把 25 个演示账号当真实成员显示在首页。生产不灌演示数据之后这个数自然变真，但仍要确认它不再把种子算进去。
- [ ] 验证脚本显式带 `NIHAOCAMPUS_SEED_DEMO=1`，这样本地验收还能用演示账号登录，生产路径干净。
- [ ] `docs/probes/count-claims.mjs` 重跑，断言数从 239 降到南京一城的部分，把新数字抄进报告。

**You see.**

- [ ] 首页只有一张城市卡「南京」，计数从 `6 个 城市` 变成 `1 个 城市`。
- [ ] `curl -s -o /dev/null -w '%{http_code}' http://localhost:41729/city/shanghai` 打印 `404`。
- [ ] `curl -s -o /dev/null -w '%{http_code}' -X POST http://localhost:41729/api/messages` 打印 `404` 或 `405`，不是 `500`。
- [ ] 页面上不再出现聊天室与成员目录入口。
- [ ] 删掉 `.data/` 后不带开关启动，`sqlite3 .data/nihaocampus.db 'select count(*) from users'` 返回 `0`，首页成员数显示 0 而不是 25。
- [ ] 带 `NIHAOCAMPUS_SEED_DEMO=1` 启动，用户数回到演示值，验证脚本可用。

**Verify, unit.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] `npm run audit:content` 在只有一座城市时仍然通过，评分不重复与卡片配色不撞的断言不因样本变少而空转。Run `npm run audit:content`.
- [ ] `npm run typecheck` 与 `npm run lint` 全绿，删表后 store 没有悬空引用。Run `npm run typecheck && npm run lint`.
- [ ] `scripts/verify.mjs` 去掉聊天步骤后仍覆盖注册、登录、发帖、回帖、改资料。Run `npm run dev` 另开终端后 `npm run verify`.

**Verify, live.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked. Ten lanes on `grok-4.6-fast-xhigh` at the PR head, per the boot recipe.

- [ ] Lane 1. Regression lane against trunk. 在 trunk 和 head 各渲染一次首页，数城市卡数量。Save `home-grid-trunk-vs-head.png`. Pass when trunk 是 6 张卡、head 是 1 张卡，且 head 无控制台报错。
- [ ] Lane 2. 打开 `/city/nanjing`，逐个点开六个校区链接。Save `city-nanjing-six-links.png`. Pass when 六个链接全部 200 且校区页标题与卡片标题一致。
- [ ] Lane 3. 依次请求五个已删城市的路径。Save `deleted-cities-404.png`. Pass when 五个全部渲染 `not-found` 页面而不是 500。
- [ ] Lane 4. 六个校区页各滚到底，检查落地清单九步、周边、气候、FAQ 都在。Save `campus-pages-full-render.png`. Pass when 六页都有九个落地步骤且无空白区块。
- [ ] Lane 5. 找聊天室入口。Save `chat-entry-gone.png`. Pass when 页面上不存在聊天 tab，且 `/api/messages` 不返回 200。
- [ ] Lane 6. 点遍站点导航每一个链接。Save `nav-no-dead-links.png`. Pass when 没有指向 `/members` 的链接且无 404。
- [ ] Lane 7. 用 `NIHAOCAMPUS_SEED_DEMO=1` 重启后以 `amina_k` 登录，发一帖再回一帖，然后不带开关重启并确认库里零用户。Save `board-works-and-prod-has-no-demo.png`. Pass when 带开关时发帖回帖正常，不带开关时 `users` 表为空。
- [ ] Lane 8. 未登录状态点发帖。Save `auth-sheet-on-post.png`. Pass when 弹出授权面板并说明为什么需要登录。
- [ ] Lane 9. 在 390px 宽度下过首页、城市页、校区页。Save `mobile-390-no-overflow.png`. Pass when 三页 `document.scrollingElement.scrollWidth` 都不超过 390。
- [ ] Lane 10. 开 `prefers-reduced-motion` 与深色模式，再走首页到校区页。Save `reduced-motion-dark.png`. Pass when 卡片动效停止、文字对比度可读、无布局错位。

**Verify, perf.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] Metric. 首页与城市页的 HTML 传输字节数，trunk 与 head 都要出数。
- [ ] Probe. `curl -s -o /dev/null -w '%{size_download} %{time_total}\n' http://localhost:41729/` 与 `.../city/nanjing`，trunk 与 head 交替各跑五次取中位数。
- [ ] Baseline. 先记 trunk 的值。线上 trunk 已实测首页 139550 字节、城市页 209022 字节，本地生产构建重测一遍作为基线。
- [ ] Rule. head 首页字节数必须低于 trunk 的 60%，因为六张城市卡删到一张。没变小就是删除没生效，判 fail。城市页字节数允许波动 5% 以内。

**Review gate.** The operator reviews before merge.

- [ ] Copy lane 1 与 lane 5 的 screenshots 到 `docs/media/p1-review-home-and-chat.png`。
- [ ] 录 30 到 60 秒 video，走首页到校区页再到留言板。Save it as `docs/media/p1-review.mp4`。
- [ ] Post the screenshots and the video in chat. Stop at merge-ready. Wait for the operator's click.

**Merge.**

- [ ] Root's clean verdict at the exact head SHA.
- [ ] Bugbot triage done.
- [ ] Rebased onto current trunk after the verdict, patch-id unchanged.
- [ ] Root 把 P1 追加为栈底，base 指向 `main`。

## 把地点升为实体并让来源必填 (P2)

**Depends on.** P1。先删五个假城市，地点迁移就少五份。

**Files.**

- [ ] Edit `src/lib/domain.ts`，`Place` 从内联值类型改成带 slug 的实体，`sources` 从可选改必填。
- [ ] Create `src/data/places.ts`，全站地点的唯一注册表。
- [ ] Create `src/app/place/[slug]/page.tsx`。
- [ ] Create `src/components/discover/place-links.tsx`，三个地图深链。
- [ ] Create `src/components/discover/backlinks.tsx`。
- [ ] Edit `src/data/cities/nanjing.ts`，全部地点改成引用 slug。
- [ ] Edit `src/components/discover/place-block.tsx`、`landing-checklist.tsx`、`spots-browser.tsx`。
- [ ] Create `scripts/audit-sources.mts`，加 `package.json` 的 `audit:sources`。

**Build.**

- [ ] 定义 `PlaceSlug` 品牌类型，`Place` 加 `slug`、`lat`、`lng`，`sources: Source[]` 改成必填。类型只要求字段存在，允许空数组，空数组由脚本管。这样漏写字段是编译错误，未核实是可见状态，两件事分开。
- [ ] `src/data/places.ts` 导出 `PLACES` 注册表，键是 slug。落地清单和周边只存 slug，不再内联地址。**这条是修根因**：体检中心的错地址现在在库里存在六份，改一处修不干净，实体化之后核验一次修好所有引用。
- [ ] `/place/[slug]` 页面渲染名称、经核验的地址、办公时间、要不要预约、电话、来源链接、从各校区哪个门出发怎么去、一键复制中文地址。
- [ ] `place-links.tsx` 生成高德、百度、Google Maps 三个深链，用 `lat` 与 `lng`。**不嵌任何地图 SDK。** 落地前用户只有 Google Maps，落地后只能用高德百度，一个嵌入式地图服务不了两端，深链两端都能用且零依赖。
- [ ] `backlinks.tsx` 反查并渲染四类反向链接，哪几步落地清单指向这里、哪些校区的周边包含这里、谁在这里留了经验、有哪些事件在这里。P2 只实现前两类，后两类留空接口给 P6 和第二批。
- [ ] `scripts/audit-sources.mts` 遍历 `PLACES` 与全部 `LandingStep`，统计带来源与空来源的条数，按 `kind` 分类，`checkedOn` 距今超过 12 个月判过期。加 `--require-campus <slug>` 参数，该校区九步或其地点只要有一条空来源或过期就以非零码退出。

**You see.**

- [ ] `npm run audit:sources` 打印每个地点的来源数与 `kind`，南航江宁以外的地点大部分是 0。
- [ ] 点校区页体检那一步的地点名，跳到 `/place/jiangsu-ithc`，页面上有创智路 39 号、来源链接、三个地图按钮。
- [ ] 地点页底部列出「第 3 步 境外人员体检」和引用它的校区。
- [ ] 把 `PLACES` 里体检中心的地址改一个字，六个校区页同时变，只改了一处。
- [ ] 删掉任意一个 `sources` 字段，`npm run typecheck` 报错并给出文件与行号。

**Verify, unit.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] `scripts/audit-sources.mts` 对构造的过期 `checkedOn` 与空数组各以非零码退出。Run `npm run audit:sources`.
- [ ] 删一条 `sources` 后编译失败，加回后通过。Run `npm run typecheck`.
- [ ] `npm run audit:content` 与 `npm run lint` 不因新形状失败。Run `npm run audit:content && npm run lint`.

**Verify, live.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked. Ten lanes on `grok-4.6-fast-xhigh` at the PR head, per the boot recipe.

- [ ] Lane 1. Regression lane against trunk. trunk 上地点是内联的、没有地点页，lane 记录该事实，然后 gate head 的行为，地点名可点、跳到独立页面、页面上有来源和三个地图深链。Save `place-entity-trunk-vs-head.png`. Pass when trunk 地点名不可点、head 可点且落到 `/place/`。
- [ ] Lane 2. 走完九步，逐个点地点名。Save `nine-places-clickable.png`. Pass when 九个地点全部落到各自的地点页且无 404。
- [ ] Lane 3. 在地点页点三个地图深链。Save `three-map-deeplinks.png`. Pass when 三个链接的 href 分别指向高德、百度、Google Maps 且都带正确经纬度。
- [ ] Lane 4. 在地点页点一键复制。Save `place-copy-chinese.png`. Pass when 剪贴板是中文名加中文地址。
- [ ] Lane 5. 检查地点页的反向链接。Save `place-backlinks.png`. Pass when 列出引用它的落地步骤与校区，数量与代码里的引用数一致。
- [ ] Lane 6. 改 `PLACES` 里一个地址后重启，看六个校区页。Save `single-edit-fixes-all.png`. Pass when 六页同时变，且 `rg` 在 `src/data/cities/` 里搜不到那个地址字面量。
- [ ] Lane 7. 看一个空来源的地点。Save `place-unverified-state.png`. Pass when 页面明确显示未核实并提示与学校国际处确认。
- [ ] Lane 8. 看一个有来源的地点。Save `place-sourced-state.png`. Pass when 来源按 `kind` 显示中文标签与核验日期，链接可点。
- [ ] Lane 9. 在 390px 宽度看地点页与落地清单。Save `place-mobile-390.png`. Pass when 三个地图按钮不换行错位，`scrollWidth` 不超过 390。
- [ ] Lane 10. 深色模式看地点页与来源行。Save `place-dark.png`. Pass when 三种 `kind` 可区分且文字可读。

**Verify, perf.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] Metric. 校区页 HTML 传输字节数与首字节时间，trunk 与 head 都要出数。地点改成引用后正文应该变小，地点页是新增的独立路由。
- [ ] Probe. `curl -s -o /dev/null -w '%{size_download} %{time_starttransfer}\n' http://localhost:41729/campus/nju-xianlin`，trunk 与 head 交替各跑五次取中位数。地点页另测一次绝对值。
- [ ] Baseline. 先记 trunk 的校区页字节数与首字节时间。
- [ ] Rule. head 校区页字节数不得超过 trunk 的 105%。地点页首字节时间绝对预算 300ms。校区页超标说明地点数据被重复内联进了每个引用点，改成按 slug 取。

**Review gate.** The operator reviews before merge.

- [ ] Copy lane 1 与 lane 6 的 screenshots 到 `docs/media/p2-review-place-entity.png`。
- [ ] 录 30 到 60 秒 video，从落地清单点进地点页，展示反向链接和三个地图深链，再改一处地址让六页同时变。Save it as `docs/media/p2-review.mp4`。
- [ ] Post the screenshots and the video in chat. Stop at merge-ready. Wait for the operator's click.

**Merge.**

- [ ] Root's clean verdict at the exact head SHA.
- [ ] Bugbot triage done.
- [ ] Rebased onto current trunk after the verdict, patch-id unchanged.
- [ ] Root 把 P2 追加到 P1 之上，base 指向 P1 分支。

## 建自托管埋点底座与指标页 (P3)

**Depends on.** None. 从 `main` 起，与 P1 并行。

**Files.**

- [ ] Edit `src/lib/db.ts`，加 `events` 表与两个索引。
- [ ] Edit `src/lib/domain.ts`，加 `EVENT_NAMES` 字面量联合。
- [ ] Create `src/app/api/events/route.ts`、`src/lib/events.ts`。
- [ ] Create `src/components/analytics/track.ts`、`analytics-provider.tsx`。
- [ ] Create `src/app/admin/metrics/page.tsx`。
- [ ] Edit `src/app/layout.tsx`，挂 provider。

**Build.**

- [ ] `events` 表字段为 `id`、`name`、`anon_id`、`path`、`campus_slug`、`locale`、`props`、`referrer`、`utm`、`created_at`。建 `(name, created_at DESC)` 与 `(anon_id, created_at)` 两个索引。
- [ ] `EVENT_NAMES` 用字面量联合加注册表，与仓库现有的 `SCORE_KEYS`、`LANDING_STEPS` 同一个写法。首批事件为 `page_view`、`campus_view`、`place_view`、`step_open`、`step_mark`、`step_done`、`copy_address`、`map_deeplink`、`locale_switch`、`source_click`、`note_read`、`note_write`、`register_start`、`register_done`。
- [ ] `POST /api/events` 用 `src/lib/http.ts` 的 zod 模式解析，事件名不在联合里直接 400。按 `anon_id` 限速每分钟 60 条，超了丢弃不报错。
- [ ] `anon_id` 存 httpOnly cookie，随机值，一年有效，不含任何个人信息。
- [ ] 客户端 `track()` 用 `navigator.sendBeacon`，失败静默。不要 await，不要阻塞交互。
- [ ] `/admin/metrics` 用 `NIHAOCAMPUS_ADMIN_TOKEN` 校验查询参数，未带或不匹配返回 404 而不是 401，避免暴露该路由存在。
- [ ] 指标页渲染四块。按天的事件计数、来源与 utm 分布、Appendix F 那条主漏斗、以及 `map_deeplink` 与 `copy_address` 的计数，后两个是「他真的要去」最直接的信号。
- [ ] 不接任何第三方分析。目标用户到中国之前在境外、之后在境内，一个横跨这条边界都可用的仪表必须是第一方的。

**You see.**

- [ ] 打开任意页面后 `sqlite3 .data/nihaocampus.db 'select name, count(*) from events group by 1'` 打印 `page_view` 计数大于 0。
- [ ] `curl -X POST http://localhost:41729/api/events -d '{"name":"bogus_event"}'` 返回 400。
- [ ] `curl -s -o /dev/null -w '%{http_code}' http://localhost:41729/admin/metrics` 返回 404，带正确 token 时返回 200。
- [ ] 指标页四块都显示数字，没有数据时显示 0 而不是崩溃。

**Verify, unit.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] `scripts/verify.mjs` 加一段，POST 一个合法事件与一个非法事件，断言 204 与 400。Run `npm run dev` 另开终端后 `npm run verify`.
- [ ] 限速断言，连发 100 条后表里不超过 60 条。Run `npm run verify`.
- [ ] `npm run typecheck && npm run lint` 全绿。Run `npm run typecheck && npm run lint`.

**Verify, live.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked. Ten lanes on `grok-4.6-fast-xhigh` at the PR head, per the boot recipe.

- [ ] Lane 1. Regression lane against trunk. trunk 没有任何埋点，lane 记录该事实，然后 gate head 的行为，一次首页访问在 `events` 表里落一条 `page_view` 且页面交互不被阻塞。Save `pageview-trunk-vs-head.png`. Pass when trunk 表不存在、head 落一条且首页可正常点击。
- [ ] Lane 2. 走首页到城市页到校区页到地点页，然后查表。Save `four-page-events.png`. Pass when 四条对应事件都在且 `path` 与实际路径一致。
- [ ] Lane 3. 点开一个落地步骤、复制地址、点一个地图深链。Save `intent-events.png`. Pass when `step_open`、`copy_address`、`map_deeplink` 三条都在且 `campus_slug` 填对。
- [ ] Lane 4. 断网后点几下再恢复。Save `beacon-offline-silent.png`. Pass when 页面无报错弹窗、无控制台异常，交互照常。
- [ ] Lane 5. POST 一个不在联合里的事件名。Save `bogus-event-400.png`. Pass when 返回 400 且表里没有该行。
- [ ] Lane 6. 一分钟内连发 100 条同名事件。Save `rate-limit-60.png`. Pass when 表里不超过 60 条且服务端未 500。
- [ ] Lane 7. 不带 token 访问 `/admin/metrics`。Save `metrics-404-without-token.png`. Pass when 返回 404，不泄露路由存在。
- [ ] Lane 8. 带正确 token 访问指标页。Save `metrics-four-blocks.png`. Pass when 四块都渲染出来。
- [ ] Lane 9. 带 `?utm_source=test-channel` 访问首页后查表。Save `utm-captured.png`. Pass when `utm` 字段记下 `test-channel`。
- [ ] Lane 10. 清 cookie 后再访问一次。Save `anon-id-rotates.png`. Pass when 新 `anon_id` 与旧的不同，且旧数据仍在表里。

**Verify, perf.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] Metric. 首页 INP 与 `POST /api/events` 的 p95 延迟。埋点绝不能让页面变卡。trunk 侧没有该接口，因此同时给出接口的绝对预算与用户等到的可交互状态。
- [ ] Probe. 用 `control-ui` 的 CDP `Performance.getMetrics` 采首页 INP，trunk 与 head 交替各三轮。接口延迟用 200 次 `curl -X POST` 排序取第 190 位。
- [ ] Baseline. 先记 trunk 的首页 INP 中位数。
- [ ] Rule. head 首页 INP 不得超过 trunk 的 110%。`POST /api/events` p95 绝对预算 50ms。首页从导航到可点击的时间不得超过 trunk 的 110%。任一项超标就把写入改成异步队列。

**Review gate.** None. P3 is not review-gated.

**Merge.**

- [ ] Root's clean verdict at the exact head SHA.
- [ ] Bugbot triage done.
- [ ] Rebased onto current trunk after the verdict, patch-id unchanged.
- [ ] Root 把 P3 追加到 P2 之上，base 指向 P2 分支。

## 把内容层改成英文优先 (P4)

**Depends on.** P2。溯源与地点实体已定型，内容文件只改一次。

**Files.**

- [ ] Edit `src/lib/domain.ts`，加 `Localized` 类型并替换所有 `*En` 配对字段。
- [ ] Edit `src/data/cities/nanjing.ts`、`src/data/places.ts`，补齐英文。
- [ ] Create `src/lib/locale.ts`、`src/components/site/locale-switch.tsx`。
- [ ] Edit `src/app/layout.tsx`，读 cookie 决定语言，默认英文。
- [ ] Edit 全部 `src/components/discover/**` 的渲染点。
- [ ] Create `scripts/audit-locale.mts`，加 `package.json` 的 `audit:locale`。

**Build.**

- [ ] 定义 `type Localized = { zh: string; en: string }`，把 `name` 与 `nameEn`、`tagline` 与 `taglineEn` 这类配对收成一个字段，同时给 `summary`、`highlights`、`pros`、`cons`、`faq`、`deadline`、`bring`、`tips`、`warning`、`note`、`hours`、`where`、`blurb`、`vibe`、`commute`、`goodFor`、`watchOut` 换成 `Localized`。
- [ ] `SCORE_META.hint`、`LANDING_STEP_META.why`、`BUDGET_META.hint` 也换成 `Localized`。实测这三处是纯中文，而它们解释的正是评分口径。
- [ ] `Place.address` 保持裸 `string` 且保持中文。这条是刻意的，地址存在的意义就是给出租车司机和窗口工作人员看。在类型上方写一行注释说明这个例外。
- [ ] 跑 `tsc`，让编译器把所有缺英文的地方列出来，逐个补齐。
- [ ] `locale.ts` 从 `nihaocampus_locale` cookie 读语言，缺失时默认 `en`。切换写 cookie 并发 `locale_switch` 事件。
- [ ] 把 `docs/probes/measure-lang.mjs` 固化成 `scripts/audit-locale.mts`。它抓渲染后的 HTML，统计纯中日韩文本段占全部文本段的比例，英文态下超过 12% 就以非零码退出。允许残留的中文段必须带 `data-cjk-intentional` 属性，也就是地址与地名。
- [ ] 清掉两处虚假的双语声明。页脚写着「内容语言：中文 / English」（`site-footer.tsx:39`），那只是文案。顶栏 `NAV` 有 `en` 字段但渲染只用中文 `label`（`site-header.tsx:4-6, 41-43`）。这一步之后前者变成真的，后者要么渲染要么删掉字段。

**You see.**

- [ ] 首次访问不带 cookie 时页面是英文，九步的 deadline、tips、warning 全是英文。
- [ ] `npm run audit:locale` 在英文态下打印纯中文段占比低于 12%，并列出残留项全部是地址。
- [ ] 切到中文后刷新仍是中文，cookie 里 `nihaocampus_locale` 为 `zh`。
- [ ] 英文态下地点页地址仍显示中文，一键复制拿到的是中文。

**Verify, unit.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] `scripts/audit-locale.mts` 对构造的纯中文页面以非零码退出，对双语页面通过。Run `npm run audit:locale`.
- [ ] 删掉任意一条 `en` 值后编译失败。Run `npm run typecheck`.
- [ ] `npm run audit:content` 与 `npm run audit:sources` 不因字段改形而失败。Run `npm run audit:content && npm run audit:sources`.

**Verify, live.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked. Ten lanes on `grok-4.6-fast-xhigh` at the PR head, per the boot recipe.

- [ ] Lane 1. Regression lane against trunk. 在 trunk 和 head 各跑 `audit-locale` 逻辑。Save `locale-share-trunk-vs-head.png`. Pass when trunk 首页纯中文段占比约 82%、城市页约 73%，head 英文态两者都低于 12%。
- [ ] Lane 2. 清 cookie 后首访首页。Save `default-locale-english.png`. Pass when 页面是英文，没有中文标题闪现。
- [ ] Lane 3. 英文态打开校区页，读完九个落地步骤。Save `landing-steps-english.png`. Pass when 九步的 deadline、bring、tips、warning 全部是英文。
- [ ] Lane 4. 英文态检查地点页与所有地址块。Save `addresses-stay-chinese.png`. Pass when 地址仍是中文且带 `data-cjk-intentional` 属性。
- [ ] Lane 5. 英文态点一键复制地址。Save `copy-gives-chinese.png`. Pass when 剪贴板内容是中文地址原文。
- [ ] Lane 6. 切到中文再刷新两次。Save `locale-persists-zh.png`. Pass when 两次刷新都是中文，cookie 值为 `zh`。
- [ ] Lane 7. 切换语言时查 `events` 表。Save `locale-switch-event.png`. Pass when 落一条 `locale_switch` 且 `props` 记下目标语言。
- [ ] Lane 8. 英文态检查评分口径说明与九步理由。Save `score-hints-english.png`. Pass when 十项口径与九步理由都是英文。
- [ ] Lane 9. 英文态在 390px 宽度过四页。Save `english-mobile-390.png`. Pass when 更长的英文字符串不撑破布局，`scrollWidth` 不超过 390。
- [ ] Lane 10. 英文态深色模式看 FAQ、优缺点、来源行。Save `english-dark-faq.png`. Pass when 文字可读、无截断、无中英混排错位。

**Verify, perf.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] Metric. 校区页在英文态与中文态的 HTML 传输字节数，trunk 与 head 都要出数。双语内容会让数据体积接近翻倍，必须有上限。
- [ ] Probe. `curl -s -o /dev/null -w '%{size_download} %{time_starttransfer}\n' -b 'nihaocampus_locale=en' http://localhost:41729/campus/nju-xianlin`，中文态换 cookie 值，trunk 与 head 交替各跑五次取中位数。
- [ ] Baseline. 先记 trunk 的校区页字节数。
- [ ] Rule. head 单一语言态的字节数不得超过 trunk 的 115%。超了说明两种语言都被送到了客户端，改成服务端按 locale 裁剪后再渲染。

**Review gate.** The operator reviews before merge.

- [ ] Copy lane 3 与 lane 4 的 screenshots 到 `docs/media/p4-review-english-landing.png`。
- [ ] 录 30 到 60 秒 video，英文态走校区页九步，切中文再切回英文。Save it as `docs/media/p4-review.mp4`。
- [ ] Post the screenshots and the video in chat. 英文文案的语气由 operator 判断，机器只能判断它存在。Stop at merge-ready. Wait for the operator's click.

**Merge.**

- [ ] Root's clean verdict at the exact head SHA.
- [ ] Bugbot triage done.
- [ ] Rebased onto current trunk after the verdict, patch-id unchanged.
- [ ] Root 把 P4 追加到 P3 之上，base 指向 P3 分支。

## 写出带来源的南航江宁校区内容 (P5)

**Depends on.** P4。内容必须直接按实体模型和双语模型写，否则要重写一遍。

**Files.**

- [ ] Edit `src/data/cities/nanjing.ts`，新增 `nuaaJiangning` 校区。
- [ ] Edit `src/data/places.ts`，新增南航江宁相关地点。
- [ ] Create `src/components/discover/campus-orientation.tsx`，SVG 方位示意图。
- [ ] Edit `src/components/discover/spots-browser.tsx`，改成四个处境入口。
- [ ] Create `docs/sources/nuaa-jiangning.md`，来源清单与核验记录。

**Build.**

- [ ] 九步内容全部来自官方或高校国际处页面，每条带 `sources`。找不到来源的写 `sources: []` 并列进报告，不要编。
- [ ] 落地手续里城市级的部分直接引用已有地点 slug，出入境管理局与体检中心不重写。校区级的只有报到地点、住宿登记派出所、校园卡中心、国际处四个新地点。
- [ ] 查清南航江宁属于哪个派出所辖区。这一条错了会让学生跑错地方而且卡住居留许可，是九步里最容易错又最少人核对的一条。
- [ ] 查清仙林与江宁各自最近的出入境受理点。已知栖霞区仙林大学城行政服务中心在文苑路 118 号，现有内容把仙林校区的学生指去了城市另一头的河西大厅，江宁校区要避免同一个错误。
- [ ] `campus-orientation.tsx` 画一个 SVG，校区一个方块，四个门标出来，每个方向注一句「南门外 200m 美食街」这类，带步行分钟数。不用图片、不用地图 SDK、不用 CDN。
- [ ] `spots-browser.tsx` 第一层入口改成四个处境，今天要办事、今天要吃饭、要住哪儿、日常。第二层才是现有的 `SPOT_CATEGORIES`。用户的心智是「我今天要开银行卡」，不是「我要找一个 grocery」。
- [ ] `docs/sources/nuaa-jiangning.md` 逐条记录每个事实、它的 URL、核验日期、以及哪些条目只能靠实地采集。这份文件是下一次复核的起点。

**You see.**

- [ ] `npm run audit:sources -- --require-campus nuaa-jiangning` 通过，九步与其地点全部带非空来源且未过期。
- [ ] `/campus/nuaa-jiangning` 渲染完整，九步、方位图、四个处境入口、周边、住宿、交通都在。
- [ ] 点九步里任一地点名，落到地点页并看到来源链接。
- [ ] 四个处境入口各点一次，第二层类别正确过滤。
- [ ] `docs/sources/nuaa-jiangning.md` 里每条事实都有 URL 或明确标注「只能实地采集」。

**Verify, unit.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] `npm run audit:sources -- --require-campus nuaa-jiangning` 返回 0，删掉任一条来源后返回非零。Run `npm run audit:sources -- --require-campus nuaa-jiangning`.
- [ ] `npm run audit:content` 与 `npm run audit:locale` 对新校区通过。Run `npm run audit:content && npm run audit:locale`.
- [ ] `npm run typecheck && npm run lint` 全绿。Run `npm run typecheck && npm run lint`.

**Verify, live.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked. Ten lanes on `grok-4.6-fast-xhigh` at the PR head, per the boot recipe.

- [ ] Lane 1. Regression lane against trunk. trunk 上不存在 `nuaa-jiangning`，lane 记录该事实，然后 gate head 的行为，该路由 200 且九步全带来源。Save `nuaa-trunk-404-head-200.png`. Pass when trunk 返回 404、head 返回 200 且页面无空区块。
- [ ] Lane 2. **来源核对 lane。** 随机抽 5 条事实性断言，独立访问其 `sources` URL，核对页面上的值与来源页上的值。Save `source-crosscheck.png`. Pass when 五条全部一致。任何一条不一致就是 fail。
- [ ] Lane 3. 点九步里每一个地点名。Save `nuaa-nine-places.png`. Pass when 九个都落到地点页且都有非空来源。
- [ ] Lane 4. 看方位示意图。Save `campus-orientation-svg.png`. Pass when 四个门都标出、每个方向有文字与步行分钟数、无外部图片请求。
- [ ] Lane 5. 依次点四个处境入口。Save `four-situation-entries.png`. Pass when 每个入口过滤出的类别正确且不为空。
- [ ] Lane 6. 检查住宿登记那一步指向的派出所。Save `police-station-sourced.png`. Pass when 地点页有非空来源且不是笼统的「以宿管给的地址为准」。
- [ ] Lane 7. 检查居留许可那一步指向的受理点。Save `visa-office-nearest.png`. Pass when 指向对江宁校区实际最近或学校统一组织的那一个，并在 note 里说明。
- [ ] Lane 8. 英文态走完整个校区页。Save `nuaa-english.png`. Pass when 除地址外没有纯中文段，`audit:locale` 通过。
- [ ] Lane 9. 在 390px 宽度过校区页与方位图。Save `nuaa-mobile-390.png`. Pass when `scrollWidth` 不超过 390 且方位图不溢出。
- [ ] Lane 10. 深色模式看方位图与四个处境入口。Save `nuaa-dark.png`. Pass when SVG 描边与文字在深色下可读。

**Verify, perf.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] Metric. 校区页 HTML 传输字节数与首字节时间。trunk 上没有这个校区，因此用 trunk 的 `nju-xianlin` 作同类参照，并给新页面绝对预算。
- [ ] Probe. `curl -s -o /dev/null -w '%{size_download} %{time_starttransfer}\n' http://localhost:41729/campus/nuaa-jiangning`，与 trunk 的 `nju-xianlin` 交替各跑五次取中位数。
- [ ] Baseline. 先记 trunk `nju-xianlin` 的值。
- [ ] Rule. 新校区页字节数不得超过 trunk 同类页的 120%。首字节时间绝对预算 400ms。SVG 方位图内联后若字节数超标，改成独立静态资源。

**Review gate.** The operator reviews before merge.

- [ ] Copy lane 2 与 lane 4 的 screenshots 到 `docs/media/p5-review-nuaa-sources.png`。
- [ ] 录 30 到 60 秒 video，走完九步并点开两个地点页展示来源。Save it as `docs/media/p5-review.mp4`。
- [ ] Post the screenshots and the video in chat. **每一条事实的准确性最终由 operator 判断，机器只能判断来源存在且值一致。** Stop at merge-ready. Wait for the operator's click.

**Merge.**

- [ ] Root's clean verdict at the exact head SHA.
- [ ] Bugbot triage done.
- [ ] Rebased onto current trunk after the verdict, patch-id unchanged.
- [ ] Root 把 P5 追加到 P4 之上，base 指向 P4 分支。

## 建标一下与署名经验 (P6)

**Depends on.** P3 与 P5。标一下要发事件，署名经验要挂在南航江宁的步骤上。

**Files.**

- [ ] Edit `src/lib/db.ts`，加 `marks` 与 `notes` 两张表。
- [ ] Create `src/lib/marks.ts`、`src/app/api/marks/route.ts`、`src/app/api/notes/route.ts`。
- [ ] Create `src/components/discover/step-mark.tsx`、`step-notes.tsx`、`progress-ring.tsx`。
- [ ] Edit `src/components/discover/landing-checklist.tsx`。
- [ ] Edit `src/app/api/auth/register/route.ts`、`src/components/auth/auth-menu.tsx`，注册只收三样。
- [ ] Edit `src/app/admin/metrics/page.tsx`，加打标分布与经验条数。

**Build.**

- [ ] `marks` 表主键是 `(anon_id, campus_slug, item_kind, item_id)`，所以重复打标是幂等的。字段还有 `user_id` 可空、`kind` 取 `planned` 或 `done`、`on_date` 可空、`created_at`。
- [ ] **`item_kind` 与 `item_id` 这对字段是给第二批留的接口。** 现在 `item_kind` 只有 `landing_step` 一个取值，第二批的用户事件是同一张表加一个取值，不需要新领域模型。见 Appendix G。
- [ ] `notes` 表字段为 `id`、`user_id` 必填、`campus_slug`、`item_kind`、`item_id`、`body`、`created_at`。经验必须署名，所以 `user_id` 不可空。
- [ ] `POST /api/marks` 免注册，用 P3 的 `anon_id` cookie 归属。`item_id` 必须在 `LANDING_STEPS` 联合里。**不要加注册门槛**，注册是这条漏斗上最大的流失点，而打标这个动作单人就有价值。
- [ ] `POST /api/notes` 要求登录。注册后把该 `anon_id` 已有的 marks 回填 `user_id`，这样他之前的进度不丢。
- [ ] 落地清单每步加打标控件，可选日期，加一个已完成开关。顶部加进度环显示「3 / 9」。乐观更新，请求失败时回滚并提示。
- [ ] 每步显示两个数，本周计划去的人数与留过经验的条数。**计数为零时不显示计数，只显示动作入口。**「0 人计划」是负信号，「标一下你哪天去」是中性的。
- [ ] 未注册访客只看到数字，看不到是谁。这是 operator 定的口径。
- [ ] 注册表单只收邮箱、密码、显示名。**不要中国手机号**，用户可能刚落地还没有号。校区、身份、国别、语言这些改成注册后在有具体回报的时刻单独问。
- [ ] 经验渲染成显示名、国别、入学年份、日期。没有国别和入学年份时只显示名字，不要留空位。
- [ ] 打标发 `step_mark` 与 `step_done`，写经验发 `note_write`，读经验发 `note_read`。

**You see.**

- [ ] 未登录点第一个步骤的打标控件并填 9 月 8 日，进度环变「1 / 9」，刷新后仍在。
- [ ] `sqlite3 .data/nihaocampus.db 'select count(*) from marks'` 返回 1，同一步连点五次仍是 1。
- [ ] 未登录点「留一条经验」时弹出授权面板并说明为什么经验必须署名。
- [ ] 注册表单只有三个输入框。
- [ ] 注册后之前的打标还在，`select user_id from marks` 已回填。
- [ ] 一个没有任何人打标的步骤上看不到「0 人」，只看到打标入口。

**Verify, unit.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] `scripts/verify.mjs` 加一段，未登录打标、重复打标、取消打标，断言表里行数为 1、1、0。Run `npm run dev` 另开终端后 `npm run verify`.
- [ ] 未登录 POST 经验返回 401，`item_id` 传不存在的值返回 400。Run `npm run verify`.
- [ ] 注册后 `anon_id` 的 marks 被回填 `user_id`。Run `npm run verify`.

**Verify, live.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked. Ten lanes on `grok-4.6-fast-xhigh` at the PR head, per the boot recipe.

- [ ] Lane 1. Regression lane against trunk. trunk 上落地清单没有任何打标状态，lane 记录该事实，然后 gate head 的行为，未登录打标后刷新仍保留且进度环读数正确。Save `mark-trunk-vs-head.png`. Pass when trunk 无打标控件、head 打标后刷新仍是「1 / 9」。
- [ ] Lane 2. 全程不登录，依次给九步打标。Save `nine-marks-anonymous.png`. Pass when 九步都能打且从未弹出授权面板。
- [ ] Lane 3. 同一步连点五次。Save `mark-idempotent.png`. Pass when 表里只有一行，界面不闪烁。
- [ ] Lane 4. 打三步后取消一步。Save `unmark-works.png`. Pass when 进度环回到「2 / 9」且表里少一行。
- [ ] Lane 5. 未登录点「留一条经验」。Save `note-requires-account.png`. Pass when 弹出授权面板并说明经验必须署名。
- [ ] Lane 6. 走完注册流程。Save `register-three-fields.png`. Pass when 表单只有三个输入框且不要求手机号。
- [ ] Lane 7. 注册后查 marks 的 `user_id`。Save `marks-backfilled.png`. Pass when 之前匿名打的标全部回填了 `user_id` 且界面进度不变。
- [ ] Lane 8. 登录后在一步上留一条经验。Save `note-attributed.png`. Pass when 经验显示名字与日期，刷新后仍在。
- [ ] Lane 9. 看一个零打标零经验的步骤。Save `empty-state-invites.png`. Pass when 页面上没有「0 人」这类计数，只有动作入口。
- [ ] Lane 10. 在 390px 宽度打标并留经验。Save `mark-note-mobile-390.png`. Pass when 控件可点、进度环不遮文字、`scrollWidth` 不超过 390。

**Verify, perf.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] Metric. 从点击打标到界面反映新状态的时间，以及 `POST /api/marks` 的 p95 延迟。trunk 侧没有这个动作，因此给出该动作的绝对预算与用户等到的稳定状态。
- [ ] Probe. 用 `control-ui` 点击并用 CDP `Runtime.evaluate` 轮询进度环文本变化，取十次中位数。接口延迟用 200 次 `curl` 取第 190 位。
- [ ] Baseline. 先记 trunk 的校区页首字节时间作为页面侧参照。
- [ ] Rule. 乐观更新的界面反映时间绝对预算 100ms。`POST /api/marks` p95 绝对预算 80ms。校区页首字节时间不得超过 trunk 的 110%，超了说明每步的计数查询没有走聚合。

**Review gate.** The operator reviews before merge.

- [ ] Copy lane 2 与 lane 9 的 screenshots 到 `docs/media/p6-review-mark-and-empty.png`。
- [ ] 录 30 到 60 秒 video，未登录打三步，注册，看进度保留，再留一条署名经验。Save it as `docs/media/p6-review.mp4`。
- [ ] Post the screenshots and the video in chat. 免注册打标与注册只收三样这两个决定由 operator 确认。Stop at merge-ready. Wait for the operator's click.

**Merge.**

- [ ] Root's clean verdict at the exact head SHA.
- [ ] Bugbot triage done.
- [ ] Rebased onto current trunk after the verdict, patch-id unchanged.
- [ ] Root 把 P6 追加到 P5 之上，base 指向 P5 分支。

## 摘掉 noindex 并公开上线 (P7)

**Depends on.** P6。

**Files.**

- [ ] Edit `next.config.ts`，设 `output` 为 `standalone`。
- [ ] Create `scripts/deploy.sh`、`scripts/smoke.mjs`、`scripts/audit-launch.mjs`。
- [ ] Edit `src/app/robots.ts`，允许抓取。
- [ ] Edit `src/app/layout.tsx`，去掉 `[测试版]` 与 `robots` 里的 `noindex`。
- [ ] Edit `README.md`，写部署与内容核验流程。

**Build.**

- [ ] 先把数据库移出部署目录。VPS 上 `mkdir -p /var/lib/nihaocampus`，拷走现有 `.data/nihaocampus.db`，PM2 环境变量设 `NIHAOCAMPUS_DB=/var/lib/nihaocampus/nihaocampus.db`。现在库在 `process.cwd()/.data` 下，一次覆盖式 rsync 就会连用户数据一起删。
- [ ] `next.config.ts` 开 `standalone` 输出。reports-vps 只有 1.6GB 内存且明令禁止机上构建，standalone 让部署不需要在 VPS 上跑 `npm install`。
- [ ] `scripts/deploy.sh` 五步。本机 `npm run build`、rsync `.next/standalone` 与 `.next/static` 与 `public` 到带时间戳的 release 目录、切 symlink、`pm2 reload nihaocampus`、跑 `scripts/smoke.mjs`。失败时把 symlink 切回上一个 release。回滚是改一个符号链接。
- [ ] `scripts/smoke.mjs` 检查首页 200、南航江宁校区页 200、一个地点页 200、`/api/events` 接受一条事件、`robots.txt` 内容符合预期、一个已删城市返回 404。
- [ ] **`scripts/audit-launch.mjs` 是上线硬门槛。** 它做两件事，跑 `audit:sources -- --require-campus nuaa-jiangning`，以及查库确认 `notes` 表里南航江宁的署名经验不少于 15 条且覆盖不少于 6 个步骤。任一项不满足就以非零码退出，`deploy.sh` 在摘 noindex 那一步之前调用它。
- [ ] 这条门槛把「找真人访谈拿经验」这件线下工作变成一个可执行的检查。第一批数据怎么来见 Appendix E。
- [ ] `robots.ts` 改成允许抓取，`layout.tsx` 去掉 `[测试版]` 前缀与 `noindex`。
- [ ] 投放链接一律带 `?utm_source=`，一个渠道一个值。
- [ ] **PM2 配置不在仓库里。** 端口 41729 硬编码在 `package.json`、`README.md` 与两个验证脚本共四处，但没有 ecosystem 文件、没有 Dockerfile、没有 deploy workflow。`deploy.sh` 不能假设仓库里有 PM2 配置，要么按名字 reload 现有进程，要么把 ecosystem 文件一并入库。选后者并在报告里说明，因为部署配置只存在于一台机器上是下一次故障的来源。
- [ ] 生产的 PM2 环境里**不要**设 `NIHAOCAMPUS_SEED_DEMO`。`smoke.mjs` 加一项，断言线上 `users` 表里没有 `@demo.nihaocampus.cn` 结尾的邮箱。

**You see.**

- [ ] `node scripts/audit-launch.mjs` 在经验少于 15 条时以非零码退出并打印还差几条、缺哪几步。
- [ ] `bash scripts/deploy.sh` 结束时打印 smoke 六项全过。
- [ ] `curl https://intro.10n1j.top/robots.txt` 不再是 `Disallow: /`。
- [ ] `curl -s https://intro.10n1j.top/ | rg -o '<title>[^<]*'` 里不再有 `[测试版]`。
- [ ] 部署两次之后 `sqlite3 /var/lib/nihaocampus/nihaocampus.db 'select count(*) from users'` 数字不变。

**Verify, unit.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] `audit-launch.mjs` 对满足两项门槛的构造输入返回 0，对差一条经验或缺一个来源的返回非零。Run `node scripts/audit-launch.mjs`.
- [ ] `scripts/smoke.mjs` 指向关掉的端口时以非零码退出。Run `node scripts/smoke.mjs http://localhost:1`.
- [ ] `npm run build` 产出 `.next/standalone/server.js`。Run `npm run build && test -f .next/standalone/server.js`.

**Verify, live.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked. Ten lanes on `grok-4.6-fast-xhigh` at the PR head, per the boot recipe.

- [ ] Lane 1. Regression lane against trunk. trunk 线上带 `noindex` 与 `Disallow: /`，lane 记录该事实，然后 gate head 的行为，公开可抓取且标题无测试版前缀。Save `robots-trunk-vs-head.png`. Pass when trunk 为 `Disallow: /`、head 允许抓取且标题干净。
- [ ] Lane 2. 在 staging 目录跑一次完整 `deploy.sh`。Save `deploy-five-steps.png`. Pass when 五步全过且 smoke 六项全绿。
- [ ] Lane 3. 故意让 smoke 失败，观察回滚。Save `deploy-rollback.png`. Pass when symlink 指回上一个 release 且服务仍返回 200。
- [ ] Lane 4. 连续部署两次后查用户表与 notes 表。Save `db-survives-deploy.png`. Pass when 两张表行数与部署前一致。
- [ ] Lane 5. 经验只有 14 条时跑部署。Save `launch-gate-blocks.png`. Pass when 门槛拦下并打印还差几条。
- [ ] Lane 6. 带 `?utm_source=lane6` 访问线上后查 `events` 表。Save `utm-through-prod.png`. Pass when `utm` 字段记下 `lane6`。
- [ ] Lane 7. 带 token 访问线上 `/admin/metrics`。Save `prod-metrics-reachable.png`. Pass when 四块与打标分布都渲染。
- [ ] Lane 8. 不带 token 访问线上 `/admin/metrics`。Save `prod-metrics-404.png`. Pass when 返回 404。
- [ ] Lane 9. 英文态在 390px 宽度过线上首页、校区页、地点页。Save `prod-english-mobile.png`. Pass when 无横向溢出且能打标。
- [ ] Lane 10. 从境外出口访问一次，模拟目标用户的真实网络位置。Save `prod-from-outside-cn.png`. Pass when 首页 200 且资源全部加载，没有依赖境内不可达的第三方域名。

**Verify, perf.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] Metric. 线上首页与校区页的首字节时间和完整加载时间，trunk 线上与 head 线上都要出数。
- [ ] Probe. `curl -s -o /dev/null -w '%{time_starttransfer} %{time_total}\n' https://intro.10n1j.top/`，切换前后各跑十次取中位数，同一网络位置。
- [ ] Baseline. 先记切换前的线上值。本次已实测首页 `time_total` 为 1.797 秒，含 TLS 与冷启动，重测确认。
- [ ] Rule. head 首字节时间不得超过 trunk 的 120%。首页 `time_total` 绝对预算 2.5 秒。超了先查 standalone 是不是缺了静态资源导致回源。

**Review gate.** The operator reviews before merge.

- [ ] Copy lane 1 与 lane 5 的 screenshots 到 `docs/media/p7-review-launch-gate.png`。
- [ ] 录 30 到 60 秒 video，跑一次 deploy 加 smoke，再展示线上英文首页到校区页打标。Save it as `docs/media/p7-review.mp4`。
- [ ] Post the screenshots and the video in chat. 摘 noindex 是不可逆的公开动作，必须由 operator 点。Stop at merge-ready. Wait for the operator's click.

**Merge.**

- [ ] Root's clean verdict at the exact head SHA.
- [ ] Bugbot triage done.
- [ ] Rebased onto current trunk after the verdict, patch-id unchanged.
- [ ] Root 把 P7 追加到 P6 之上，base 指向 P6 分支。operator 自下而上落地全栈。

## Close the program

- [ ] Every box above is checked with its evidence.
- [ ] 更新根仓 `STATUS.md` 的 NihaoCampus 一行，写清已公开、滩头校区、来源覆盖率、署名经验条数。
- [ ] 在 `ops-log/` 写一条上线记录，含 utm 渠道与投放时间。
- [ ] `docs/sources/nuaa-jiangning.md` 入库，它是下一次复核的起点。
- [ ] Reply to the operator with the report `autopilot-stack.md` names，栈底与栈顶链接、每一环一句 verdict、以及被排除的项和理由。

## Appendix A. Prototype evidence

六个探针在 trunk `330aa69` 上跑过。三个是脚本，一个是仓库历史查询，两个是对外部来源的核实。脚本都在 `docs/probes/`，可重跑。

**语言探针，已回答。** `docs/probes/measure-lang.mjs` 抓线上渲染后的 HTML。首页 198 段文本里 163 段是纯中文无英文对照，占 82.3%。城市页 286 段里 209 段，占 73.1%。缺口的位置比比例更糟，标签层是双语的，内容层是纯中文的，而 tips 和 warning 才是价值。P4 把它固化成 `scripts/audit-locale.mts`。

**结构探针，回答了一个我没问的问题。** `docs/probes/census-content.mjs` 第一次跑出全零，那是仪表错了不是内容空了。顺着查发现落地清单是每个城市文件里一个 `landingSteps()` 工厂，同城所有校区共用同一份九步，只替换六个字符串（`src/data/cities/nanjing.ts:82`）。这说明代码不小心找对了领域模型，落地手续九成是城市级的，校区级的只有报到地点、住宿登记派出所、校园卡中心、国际处，以及真正需要实地采集的周边。P2 的地点实体化建立在这条发现上。

**断言普查，已回答。** `docs/probes/count-claims.mjs` 统计会被学生当作权威信息去执行的断言，也就是地址、办公时间、费用。全仓 239 条，其中 0 条带来源。address、hours、feeCny 在六个城市里数量完全一致（4、7、8），因为它们共用同一个工厂形状。

**内容作者探针，已回答，且决定了整个方案的重心。** `git log --format='%h %ad %an %s'` 显示全部内容提交的作者都是 `Cursor Agent`，全部在 2026-09-14 一天内。单个提交 `8a4eeaa` 一次加了 1943 行、跨四个城市文件。

**事实核实，抽两条，两条都错。** 体检那一步，现有内容写地址「建邺区乐山路 9 号」，保健中心自己的联系页写的是「创智路 39 号」（`https://www.ithc.cn/js/contactus.html`）。现有内容写时间 8:00-11:00，实际是 8:30-11:30 体检、12:20-14:40 取报告（`https://sie.jmi.edu.cn/3213/list.htm`）。现有内容完全没提必须先在微信公众号预约，没预约现场不受理（同上，以及 `https://sie.jmi.edu.cn/tjyy/list.htm`）。现有内容写费用 400 元，另一所学校的国际处页面写体检 538 元、验证证明另收 60 元（`https://iec.njucm.edu.cn/en/mobile/detail/1037.html`）。出入境那一步，地址「江东中路 265 号」是对的，但时间错了，现有内容写「周一至周六 9:00-17:00」，河西接待大厅实际是周一至周五 9:00-17:30，那个周一至周六的时间属于白下路 173 号另一个大厅（`https://nj.bendibao.com/live/201563/53889.shtm`）。

**线上复现，已确认。** `curl` 抓 `/campus/nju-xianlin` 后 `rg`，`乐山路 9 号`、`周一至周六 9:00-17:00（周六不办理部分业务）`、`¥400` 都在线上渲染，而「预约」在整个校区页命中 0 次。

**代码审计，独立方法印证了语言测量。** 一次只读代码审计按「用户能读到的字里有多少没有并列英文」估算，结论是四分之三到五分之四。我的探针按文本段算，首页 82.3%、城市页 73.1%。两个方法量的不是同一个东西却落在同一区间，所以这个缺口不是测量偏差。审计另外确认了三件与本方案相关的事实。聊天是每 3 秒 HTTP 轮询而 UI 写着「实时」（`chat-room.tsx:140-142, 204-205`）。`communityStats` 扫全表把演示账号算成真实成员（`store.ts:345`）。`users` 表没有 `is_demo` 列，所以真人注册与种子账号在数据层面不可区分，这条改了 P1 的做法。

**仍未证明的两件事。** 第一，剩下 237 条断言的错误率。抽了两条都错，但两条不足以推出基础错误率，所以全部按未核实处理。第二，有没有人要这个东西。零埋点意味着站点从 09-15 上线至今没有记录过任何一次访问，`rg` 全仓搜分析类关键词只命中 Radix 的 `ProgressTrack` 组件名。

## Appendix B. Alternatives rejected

**保留排行榜与实时在线人数。** 数字游民每一到三个月换一次城市，是高频重复决策者。留学生选校一生一次，被录取之后没有选择权，排行榜对他不产生决策价值。但「此刻有几个人在」这个直觉是对的，错的只是计数对象。它被搬到了 P6 的「本周还有几个人计划去办这件事」，锚点从在线状态换成了那件事和那一天。这里的密度是学历日程给的，不是人数堆出来的，九月同一校区的新生全部在同一个四周窗口里办同样九件事，所以二十个人也够。

**保留聊天室。** 同步房间需要同时在线，二十人的期望并发接近零，空房间在证明这里没人。异步留言板在同一密度下累积，而且可以用真实问答预置。所以留留言板、删聊天室。这条分界线不是功能取舍，是同步与异步在低密度下的性质差异。

**保留成员墙与成员目录。** 价值随人数平方增长，五到五十人时接近零，而审核与隐私成本是立刻发生的。十二个成员的成员墙告诉访客这里没人。

**设收费墙。** MVP 一分钱不收。真实成员不到一百名时付费看资料的价值是负的，Nomad List 能收费靠十年积累的上千城市数据库，而这个群体真实的付费意愿在服务上，不在信息上。要探付费信号用不需要建收费墙的方式，在第九步之后放一个邮件登记框问「需要有人陪你去办居留许可吗」，数留邮箱的人数。永远不要给「看对方详细信息」定价，那是给最不值钱的东西定价。

**嵌入式地图 SDK。** 地图回答「它在哪」，但用户在每一步的问题是「我到了要干什么、带什么、今天开不开门」，地图答不了。而且落地前用户只有 Google Maps，落地后只能用高德百度，一个嵌入式地图服务不了两端。改成地点实体加三个深链，两端都能用且零依赖。第一版也不放静态地图截图，那要处理版权。

**任何外部数据接入。** MVP 零接入。唯一值得接的东西（政务办事信息）没有 API，而有 API 的东西对决策没有影响。天气不接实时，因为用户在做「九月来带什么衣服」的决策而不是查今天几度，已有的十二个月表就够。汇率不接，精确到小数不改变决策。学校官方信息手抄加存 URL 和核验日期，一年变一次，抓取的工程量远大于手抄。

**第三方分析。** 目标用户到中国之前在境外、之后在境内，一个横跨这条边界都可用的仪表必须是第一方的。境内不可达的分析域名会让一半数据消失，而那一半正是最需要的落地后行为。

**注册时收全部资料。** 现有 `users` 表有十七个字段。注册的时刻正好是用户最没有能力的时刻，可能刚落地、没有中国手机号、机场慢网、有时差。所以注册只收三样，其余在他想要东西且当场有回报的时刻单独问。字段一个不删，只是不在注册时问。

**按衣食住行分类周边。** 那是中文框架，而用户是外国人且被处境驱动。改成四个处境入口，今天要办事、今天要吃饭、要住哪儿、日常。「衣」这一类砍掉，留学生买衣服在网上，不需要指路，现有 `SPOT_CATEGORIES` 里本来也没有服装类。

**平台撮合见面并承担安全审核。** operator 定的口径是平台不撮合见面，只记录谁在何时去了哪里、和谁互动、事情办得怎么样。这减少了一层不该由平台承担的责任，也简化了实现。唯一保留的控制项是「不再接收此人消息」，那不是安全撮合，是他对自己收件箱的控制权，落在第二批。

**内容搬到 JSON 或 SQLite 以便免构建改内容。** 只有一座城市时本地构建加 rsync 是几分钟的事。`README.md` 把类型即内容契约称为最值得说的设计决定，这条判断是对的，不要为省几分钟部署去换掉编译期保障。内容量到三座城市以上再重估。

**一次做完六城二十校区再上线。** 239 条断言 0 条带来源，扩城市只是把未核实的断言数量乘以三。

## Appendix C. Risks

**剩下 237 条断言的错误率未知。** 抽两条都错，但两条推不出基础错误率。落在 P2 的必填字段与 P5 的来源核对 lane。最坏情况是错误集中在最难查证的那些条目上，也就是校区级的周边信息，而那些恰好只能实地采集。owner 盯 `audit:sources` 的覆盖率，operator 盯 P5 review gate 的抽查。

**内容会过期，而过期告警只是提醒不是解决。** 签证费用、办公时间、预约方式每年都变。`checkedOn` 超过 12 个月会告警，但真正修它需要人再查一遍。这是这个产品长期的人力成本，没有技术办法绕开。它也是护城河的来源。

**数据库在部署目录内。** 库在 `process.cwd()/.data/nihaocampus.db`，线上就是 `/var/www/nihaocampus/.data/`。一次覆盖式 rsync 会连用户数据一起删。落在 P7 的第一个 build 方框。

**行为追踪与欧盟学生。** `anon_id` cookie 加事件表构成行为追踪，目标用户里有欧盟学生。落在 P3。MVP 的处理是不采集任何个人信息、cookie 不跨站、指标页只看聚合。真要合规还需要一条 cookie 告知，本方案没有包含它。

**删 `messages` 表不可逆。** 线上可能已有真实数据而我们不知道，因为零埋点。落在 P1，先备份再查行数再动 schema。

**第二批的事件面会招广告与诈骗。** 事件是唯一一个用户可自由输入且被别人看到的面，会招招生中介、租房中介、二手诈骗。二十人时 operator 自己看得过来，规模一上来必须做审核。不在 MVP 里建后台，记在 Appendix G。

**摘 noindex 之后信任损失不可逆。** 如果内容被发现是生成的，代价是永久的。P2 的来源体系是对冲，它把未核实变成公开可见的诚实标注而不是隐藏的缺陷。标注未核实反而是相对其他留学信息站的差异点。

## Appendix D. Links and reading list

改 `src/lib/domain.ts` 之前读 `README.md` 的「两个值得说的设计决定」。P2、P4、P5 都动这个文件的形状。

P7 触及生产，之前读根仓 `docs/ops-rules.md` 与 `docs/git-conventions.md`，以及 `STATUS.md` 里 reports-vps 那一行，1.6GB 内存且禁止机上构建。现有 noindex 的来历在 `ops-log/2026-09-15-nihaocampus-preview-protection.md`。

P2 与 P4 改领域模型形状，开工前跑 `pstack/skills/how/SKILL.md`。P7 摘 noindex 是不可逆的公开动作，之前跑 `pstack/skills/interrogate/SKILL.md`。

P5 的来源清单落在 `docs/sources/nuaa-jiangning.md`。已知最高性价比的源头不是政府网站，是**同城其他学校国际处的页面**，他们已经为自己的留学生把政务流程整理和翻译过一遍。本次核实用到的两个例子是 `https://sie.jmi.edu.cn/3213/list.htm` 与 `https://iec.njucm.edu.cn/en/mobile/detail/1037.html`，后者有英文版。

每个 owner 按 `pstack/skills/show-me-your-work/SKILL.md` 起 `decisions.tsv` 并保持未提交，只有 P5 与 P7 那两份入库，因为内容核验与上线决策需要可审计。

## Appendix E. 第一批真实数据怎么来

一个访客打开零用户的站点会立刻走，所以第一批「人的数据」不能等用户产生，必须手动灌，而且必须真人真事、署名、可核验。三个来源按可信度排。

**访谈已落地的学生。** 找五到十个在南航或南京的留学生，每人二十分钟，产出十到二十条挂在具体步骤上的经验。**关键是署名**，显示名、国别、入学年份、以及「这条由某人在某月提供」。**这五到十个人就是第一批用户。** 给他们建账号，把经验署名挂上去，告诉他们以后有人问这一步会问到他。他们是飞轮第一圈的手摇柄。

**公开的学生经验帖。** 小红书、知乎、Reddit、各校留学生群里有大量落地经验，可以引用，但必须标来源链接、标明是引用、并和官方信息对过。这一层铺量快，可信度低于访谈，在 `Source.kind` 里对应 `secondary`。

**官方文档。** 学校国际处新生手册、出入境办事指南、同城其他学校国际处的整理页。这一层最可靠但最干，它不构成「人」。对应 `official` 与 `university`。

**上线的数量门槛是至少 15 条署名经验，覆盖至少 6 个步骤。** 低于这个数页面还是空的。`scripts/audit-launch.mjs` 在 P7 里强制这条。

**冷启动的界面规矩：空状态不展示计数，展示邀请。** 「当前 0 个事件」是负信号，「发起第一件事」是中性的。落在 P6 的 build 方框与 lane 9。

## Appendix F. 没人用怎么归因

按现在的形态上线，四个变量同时动，假数据、看不懂的语言、空房间、没流量，任何结果都不可解释。P1 到 P6 的作用就是把变量逐个固定，让这个问题可回答。

主漏斗是 `campus_view` 到 `step_open` 到 `step_mark` 到 `step_done` 到七日内回访。归因表如下，每一行对应一个不同的动作。

- 有流量、无 `campus_view`，说明首页没讲清这是什么，或者渠道投错了人。
- 有 `campus_view`、无 `step_open`，说明落地清单不是他要的东西。
- 有 `step_open`、无 `copy_address` 也无 `map_deeplink`，说明他在读但没打算去，内容还停在「有意思」没到「我要用」。
- 有 `step_open`、无 `step_mark`，说明清单能读但不足以照着做，缺的是具体度。
- 有 `step_mark`、无 `step_done`，说明他计划了但没回来标完，要么没发生要么没有回访动力。
- 有 `step_done`、无 `note_write`，说明他办完了但没有留下经验，供给侧没起来，这是飞轮断在第二圈。
- 全都没有且流量为零，说明是投放问题不是产品问题，换渠道再测一次。

没有埋点，这七行一行都分不出来。这就是 P3 排在最前面并与 P1 并行的理由。

## Appendix G. 第二批做什么，以及本方案给它留了什么

本方案不实现第二批，只保证数据形状容得下。P6 的 `marks` 表用 `(item_kind, item_id)` 定位一件事，现在 `item_kind` 只有 `landing_step` 一个取值。第二批加取值，不加领域模型。

**六个互动动作。** 标一下与留经验已在 P6。剩下四个是同行、问一句、帮个小忙、谢一下。三条设计原则先定，它们决定每个动作的形状。

每个动作必须有正当事由，因为陌生人之间没有事由的接触会变成骚扰，而这个群体是年轻人独自在异国，风险不对称。所以同行只在同一步同一周有标记的人之间可用，问一句只能问已办完这步而你还没办的人，帮个小忙给三个预设加自定义，预设是帮我翻译这句话、帮我打个电话问一下、陪我去一次。边界清楚的请求有人应，开放式的请求没人应。

**答案默认公开。** 问一句的回答挂在那个步骤下面所有人可见，私聊是例外不是默认。一次回答服务后来所有人，内容才会累积，私聊帮一个人然后蒸发。

**只有正向计数，没有排行榜。** 谢一下显示在个人卡片上，不做排名页。

**用户事件与关注。** 一件事上有两种关系，我也去带日期是强关系，关注不承诺去是弱关系。关注的承诺成本远低于同行，所以人少的时候先转起来的是它。可见性是访客只看数字，注册用户能看内容能关注，**建立者能看到多少人关注、谁在关注**。这个不对称是刻意的，创建者拿到的信息就是他继续办事的动力。校区页顶部显示当前多少件事、多少人，数字为零时不显示。

**它为什么让产品从 B 段长到全生命周期。** C 段不需要落地清单了，但需要周末谁去哪、谁一起打球。D 段需要我回国了谁接手我的自行车、有人来我这个国家吗。两段用同一个事件机制。所以九步清单是 B 段的接口，用户事件是 C 段与 D 段的接口，A 段靠内容本身。

**启动第二批的条件。** P7 上线后主漏斗有数据，且注册用户数到两位数。在那之前加互动只是给空房间加门。

**第二批必须同时做的两件事。** 一个「不再接收此人消息」开关，因为问一句一旦存在就有了收件箱，收件箱必须能关。以及一个最小的审核能力，因为用户事件是第一个自由输入面。
