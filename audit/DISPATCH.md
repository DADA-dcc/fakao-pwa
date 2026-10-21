# 多 AI 协作派工方案

目标：把可并行、可批量、低歧义的工作交给其他 AI（Gemini / argon4 / opencode），
我负责**任务拆分、质量校验、最终合并**——避免出现"改了但改错"的情况。

## 零、协作架构

```
我：导出批次 → 其他 AI 处理 → 回收输出 → 我校验 → 写入题库 → 推送
     audit/outbox/            audit/inbox/     apply_analysis.py
```

关键设计：**其他 AI 只接触单个小 JSON 文件，不接触仓库结构**，
输出格式由机器强制校验（占位词 / 长度 / 答案一致性 / id 存在性）。

## 一、可派工任务总览

| # | 任务 | 规模 | 可并行度 | 风险 | 优先级 |
|---|---|---:|---|---|---|
| T1 | 解析补写 | 2,368 条 | 极高（按科目×批次） | 中（需校验） | **最高** |
| T2 | 重复题去重判定 | 86 组 | 高 | 低 | 高 |
| T3 | 分案题/短题干判定 | 241 条 | 高 | 中 | 中 |
| T4 | 法条条号核验 | 65 条 | 中 | 中（需查证） | 中 |
| T5 | 学科错标重新归类 | 约 190 条 | 高 | 低 | 中 |

**不派工**（需法考专业判断或涉及代码一致性，我保留）：
- 答案错误的最终裁定（9147 等）
- 坏题改写（9181、7529）
- 前端代码改动
- 合并、校验、推送

## 二、T1 解析补写（主力任务）

### 科目与批次

| 科目 | 待补 | 建议批次数（每批 40） |
|---|---:|---:|
| 民法 | 1,171 | 30 |
| 知识产权法 | 262 | 7 |
| 行政法 | 242 | 6 |
| 宪法 | 216 | 6 |
| 商经法 | 196 | 5 |
| 民诉法 | 123 | 4 |
| 刑诉法 | 52 | 2 |
| 司法制度与职业道德 | 38 | 1 |
| 法理学 | 36 | 1 |
| 国际法 | 16 | 1 |
| 法制史 | 9 | 1 |

### 操作步骤

```bash
# 1. 导出（自动跳过法考不考的税法/外汇/外贸题）
python audit/export_batch.py 民法 --size 40 --name minfa_03
python audit/export_batch.py --all --size 40        # 一次导出各科首批

# 2. 把 audit/outbox/<name>_input.json + <name>_prompt.md 交给其他 AI

# 3. 其输出存为 audit/inbox/<name>_output.json，回收
python audit/apply_analysis.py audit/inbox/minfa_03_output.json --dry-run   # 先试运行
python audit/apply_analysis.py audit/inbox/minfa_03_output.json             # 再写入
```

`_prompt.md` 已写好完整任务说明，可直接复制给其他 AI，无需再解释。

### 验收标准（脚本强制）

- 不含"请参考""详见教材"等占位措辞
- 长度 ≥ 60 字
- 含「正确答案为X」且与输入 answer 完全一致
- id 必须存在于输入

不通过的不写入，返回修正。

## 三、T2 重复题去重（86 组）

导出命令（需我补一个导出器，或直接用 `audit/report.json` 的 `F_duplicate` 项）：

```bash
python audit/scan.py --json audit/report.json
```

**交给其他 AI 的判定要求**：
- 输入：每组重复题的 id、题干、选项、答案、解析完整度
- 输出：`{"保留": "id1", "删除": ["id2"], "理由": "……"}`
- 判定原则：保留解析更完整、题干更准确、选项更规范的一题

## 四、T3 分案题/短题干判定（241 条）

- `B_missing_material` 37 条：题干含"事实一/二/三"，确属分案题缺共享案情
- `B_short_stem_person` 204 条：短题干且仅出现甲乙丙丁，需逐条判断是否缺材料

**交给其他 AI 的判定要求**：
- 输入：题干、选项、答案
- 输出：`{"id": "xxx", "缺材料": true/false, "应补充的案情": "……"}`
- 判定原则：仅凭题干能否作答——若需知道前情才能选，即为缺材料

## 五、T4 法条条号核验（65 条）

当前 `E_article_out_of_range` 依赖 `audit/scan.py` 中的 `LAW_MAX` 表，
该表的条文总数**未经权威核验**，直接改有风险。

**交给其他 AI 的核验要求**：
- 输入：`LAW_MAX` 表中的法律名称与条数
- 输出：每部法律的现行有效条文总数 + 来源依据
- 特别注意：《立法法》（2023 修正）、《法官法》《票据法》等

核验完成后我再批量修正。

## 六、T5 学科错标重新归类（约 190 条）

已知错标：
- 民法.json 中的 CPA 题 155 道（已标 `source: "CPA"`，建议移入商经法或单列）
- 刑法.json 中的法制史题约 35 道（建议移入法制史）
- 民诉法/宪法/法理学中的 CPA 题 9 道

**交给其他 AI 的判定要求**：
- 输出：`{"id": "xxx", "当前科目": "民法", "应归科目": "商经法", "理由": "……"}`

## 七、分工建议

按工具特性分配（请按你实际使用的工具对号入座）：

| 工具类型 | 适合任务 | 理由 |
|---|---|---|
| 长上下文、能读大文件的（如 Gemini） | T1 大批量解析、T5 归类 | 一次可处理整批 |
| 命令行/编码型 agent（如 opencode） | T2 去重、T3 判定、跑脚本 | 可直接读写文件、执行校验 |
| 本地开源模型（如 argon4） | T1 中小批次、T4 条号核验 | 可反复迭代，成本低 |

## 八、风险与对策

| 风险 | 对策 |
|---|---|
| 其他 AI 写错法律依据 | 脚本校验 + 我抽检每批 20%；存疑的不写入 |
| 输出格式不统一 | `_prompt.md` 强制 JSON 格式，脚本解析失败即退回 |
| 多 AI 风格不一致 | 统一"正确项依据 + 错误项排错 + 正确答案为X"三段式 |
| 与其他 AI 改动冲突 | 每批独立文件，按 id 幂等写入，不会互相覆盖 |
| 解析质量参差 | 先跑 1–2 批验证，质量达标再放量 |

## 九、我的保留职责

1. 任务拆分与批次导出
2. 答案错误的最终裁定（9147、9181、7529 等）
3. 每批输出的机器校验与人工抽检
4. 与题库的合并、冲突处理、提交推送
5. 前端适配（如需展示新的标注字段）

## 十、立即可以开始的命令

```bash
# 导出全部科目的首批（每科 40 题）
python audit/export_batch.py --all --size 40

# 看看导出了什么
ls audit/outbox/
```

然后把 `_input.json` 与 `_prompt.md` 一起交给其他 AI 即可。

## 十一、opencode 交付的工具箱（2026-10-19）

| 脚本 | 作用 | 用法 |
|---|---|---|
| `audit/apply_all.py` | 批量回收 inbox 解析：逐批 dry-run、汇总表、按 id 集合去重、`--write` 才落库（原子写 + 写前指纹校验） | `python audit/apply_all.py` ／ `python audit/apply_all.py --write` |
| `audit/qc_sample.py` | 解析质量抽检：每批随机 20%（`--all` 全量），7 项检查；`--length-table` 出长度分布表 | `python audit/qc_sample.py` ／ `python audit/qc_sample.py --all --length-table --json audit/qc_report.json` |
| `audit/export_T2_T3.py` | 从 report.json 导出 T2 重复题分组、T3 短题干/缺材料 241 条（附 P2 两类各 20 条样本） | `python audit/export_T2_T3.py --dry-run` ／ `python audit/export_T2_T3.py --samples 20` |
| `audit/fix_subject_tags.py` | T5 学科错标：关键词画像出提案 + 按人工确认的映射搬移题目、改 subject、刷新 index.json（改前备份） | `python audit/fix_subject_tags.py --propose` ／ `python audit/fix_subject_tags.py --apply --map <映射.json>` |
| `audit/export_batch.py` | 新增 `--suffix`（批次名后缀，避免覆盖旧批）、`--skip-exported`（跳过已派出的 id）、`--force` | `python audit/export_batch.py --all --size 40 --suffix _b2 --skip-exported` |

红线（已遵守）：`audit/inbox/*.json` 只读不改；`questions/*.json` 不由 opencode 写入；
`audit/fix_stems.py` 不动。落库命令由本人执行。

当前给 WorkBuddy 的工作单：`audit/outbox/WORKBUDDY_TODO.md`（阻塞项 + 返工清单 + 下一批 250 题）。

### 本轮实测结论（inbox 快照 2026-10-19 23:51，指纹见 `apply_all.py` 输出）
- 13 个 inbox 文件 → 去重后 12 批、385 条，**可写入 383 条**；188/205 因答案口径冲突（文中 D/AD，题库 C/A）被拦下
- 长度口径：0 条 <120，75 条在 120–220，**310 条 >220**（中位 253，最长 300）；
  仅按汉字计 208 条 >220 → 与「120–220 字」的要求仍系统性不符
- 其余 6 项（占位词/英文残留/英文双引号/套话开头/旧法名/存在性）全量 385 条均无命中
- WorkBuddy 仍在改动 inbox，写库前须用 `apply_all.py` 的批次指纹核对版本（`--write` 时指纹不符会自动中止）

