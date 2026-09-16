# 你好校园 NihaoCampus

给来华留学生的城市与校区指南。和 Nomad List 按国家排不同，这里按**城市 → 大学校区**排，因为一个留学生真正要活下去的地方不是「中国」，是某个校区的南门外那三百米。

南京是示例城市，内容做到最细。

A Nomad List style guide for international students in China, organised by city and then by university campus. Nanjing is the worked example.

## 它解决什么

- **首页**是城市和校区的动效卡片网格，可以按预算、英语友好度、国际生氛围筛选和排序。
- **校区页**是落地的、微观的：九步落地清单（报到、住宿登记、体检、居留许可、手机卡、银行卡、移动支付、校园卡、医保），每一步写清楚去哪、带什么、多少钱、办多久、踩过什么坑，地址是中文的，可以一键复制给出租车司机看。再加上周边吃住、住哪儿、交通、气候、优缺点、FAQ。
- **每个城市和校区都有自己的留言板**，以及一面成员墙。
- **注册的人自己填资料**，填完就出现在校区的成员墙和成员目录里。
- 任何需要登录的操作都会弹出授权面板，并说明为什么需要登录。

## 本地运行

```bash
npm install
npm run dev
```

打开 http://localhost:41729

首次启动会在 `.data/nihaocampus.db` 建一个 SQLite 库。默认不写入演示账号。`users` 表没有 `is_demo` 列，生产环境灌演示数据会让真人注册无法区分。

本地要灌演示成员和帖子时，启动前加上 `NIHAOCAMPUS_SEED_DEMO=1`。只有这时才会写入 25 位成员和演示帖子，共用密码是 `nihaocampus`，用户名例如 `amina_k`。想从零开始就删掉 `.data/` 再启动。不要在生产环境设置这个开关。

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # eslint
npm run build       # 生产构建
```

## 验证

```bash
npm run audit:content              # 内容结构：深度、评分不重复、卡片配色不撞

NIHAOCAMPUS_SEED_DEMO=1 npm run dev   # 另开一个终端，验证脚本要登演示账号
npm run verify                        # 注册、登录、发帖、回帖、改资料，走真实 HTTP

NIHAOCAMPUS_SEED_DEMO=1 npm run build && NIHAOCAMPUS_SEED_DEMO=1 npm start
npm run check:browser                 # 真浏览器点一遍：筛选、切换、tab、授权面板、复制地址、
                                      # 减少动效、390px 下的横向溢出
```

`check:browser` 需要 Chrome，默认取 `/usr/local/bin/google-chrome`，可用 `CHROME_PATH` 覆盖。

它建议跑在生产构建上。Next 的开发模式在 `await` RSC 数据之前会先建 HMR WebSocket，所以在禁止 WebSocket 升级的沙箱里，`next dev` 的页面服务端渲染正常、但永远不会 hydrate——看上去就像所有按钮和筛选都坏了，其实是环境。生产构建没有这条链路。

## 结构

```
src/
  lib/domain.ts     内容模型。评分、花费、落地步骤、周边分类都是字面量联合 + 注册表，
                    少一个标签就编译不过。城市和校区 slug 是 branded 类型，不会互相串。
  lib/db.ts         SQLite 连接与建表
  lib/store.ts      成员和留言的全部读写。数据库行在这里变成域对象，
                    联系方式只有在调用方明确要求时才带出来。
  lib/auth.ts       scrypt 密码、会话 cookie、currentMember()
  lib/http.ts       所有不可信输入在这里被 zod 解析成域数据
  lib/seed.ts       演示数据
  data/cities/      内容。每个文件导出一个 CityPack（一座城市 + 它的校区）
  data/index.ts     内容注册表与查询
  app/              路由。/、/city/[slug]、/campus/[slug]、/members、/u/[username]、/settings
  components/       art 卡片绘制、auth 授权面板、discover 发现页、social 留言板、member 成员
```

### 两个值得说的设计决定

**校区不带 `city` 字段，城市也不带 `campusSlugs` 列表。** 校区属于哪座城市，由它在哪个 `CityPack` 里决定，所以不存在两份需要同步的名单。查询走 `src/data/index.ts` 里构建的 Map。

**落地清单是 `Record<LandingStepId, LandingStep>`，气候是十二元组。** 以前一个校区少写一步、少写一个月也能通过编译，坏的是页面。现在坏的是构建。

## 内容怎么加

在 `src/data/cities/` 加一个文件，导出一个 `CityPack`，然后在 `src/data/index.ts` 的 `CITY_PACKS` 里引入。类型会告诉你还缺什么。照着 `nanjing.ts` 的深度和口吻写：具体的地点、具体的价格、具体的坑，不要营销腔。

卡片没有用任何图片。每张卡是一个 `motif` 剪影加三个渐变色，在浏览器里画出来，所以加一座城市不需要找图、不需要授权、也不依赖 CDN。

## 免责

内容由社区维护，签证政策、价格、营业时间都会变。涉及居留许可、体检、保险这类事，出发前请再和学校国际处或当地出入境管理局确认一次。
