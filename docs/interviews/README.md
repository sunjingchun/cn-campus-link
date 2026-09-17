# 第一批署名经验（Appendix E）

上线门槛：`notes` 表里南航江宁至少 **15 条署名经验**，覆盖至少 **6 个落地步骤**。`scripts/audit-launch.mjs` 会在 `deploy.sh` 第一步强制检查。

## 三条来源（按可信度）

1. **访谈已落地学生**（首选）——显示名、国别、入学年份、提供月份。给受访者建账号，经验挂在其名下。
2. **公开学生帖**（次要）——正文引用原话或经受访者确认的转述，`source_url` 必填，正文末尾会自动附上链接。
3. **官方文档**——不构成「人的经验」，写在 `src/data` 的来源字段里，不进 `notes`。

**不要**用 `audit-launch.mjs` 的 fixture 或任意构造 JSON 灌生产库过关。

## 访谈 SOP（约 20 分钟 / 人）

1. 确认对方愿意署名（显示名 + 国别 + 入学年份可在站上展示）。
2. 按九步清单问：「你这一步在哪办的、带了什么、花了多久、踩过什么坑？」只记对方亲口说的内容。
3. 把每条经验对应到一个 `item_id`（见下表）。
4. 填 `docs/interviews/notes.template.json`，复制为 `notes.json`（**不要 commit 含真邮箱/密码的文件**）。
5. 若生产库里有旧版 `@demo.nihaocampus.cn` 演示账号，上线前先清掉（`npm run purge:demo -- --dry-run`）。
6. 在本机或 VPS 上导入（先 `--dry-run`）：

```bash
node scripts/import-interview-notes.mjs --dry-run docs/interviews/notes.json
NIHAOCAMPUS_DB=/path/to/nihaocampus.db node scripts/import-interview-notes.mjs docs/interviews/notes.json
NIHAOCAMPUS_DB=/path/to/nihaocampus.db npm run audit:launch
```

7. 让受访者登录核对显示名与正文，必要时在站上编辑或删帖（后续功能）。

## `item_id` 对照

| 步骤 | `item_id` |
|------|-----------|
| 报到 | `registration` |
| 临时住宿登记 | `tempResidence` |
| 体检 | `healthCheck` |
| 居留许可 | `residencePermit` |
| 手机卡 | `simCard` |
| 银行卡 | `bankAccount` |
| 移动支付 | `mobilePay` |
| 校园卡 | `campusCard` |
| 医保 | `insurance` |

## JSON 字段

见同目录 `notes.template.json`。`contributors[]` 一人一行账号；`notes[]` 一条经验一行，`contributor_email` 必须已在 contributors 里声明。

导入脚本会：

- 拒绝 `@demo.nihaocampus.cn` 邮箱
- 对已存在邮箱复用 `user_id`（只追加 notes）
- 对新邮箱创建用户（密码由 operator 在 JSON 里设临时值，交付后让对方改密）
- 跑完打印 `audit-launch` 同款 notes 统计
