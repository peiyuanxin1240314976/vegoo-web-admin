# 与官方 Web Interface Guidelines 对齐说明

## 官方权威来源（以这里为准做 diff）

| 用途 | URL |
|------|-----|
| 审查规则正文（Agents 用） | [command.md @ main](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md) |
| 人机可读长文 | [README / 正文](https://github.com/vercel-labs/web-interface-guidelines/blob/main/README.md) |
| 仓库 | [vercel-labs/web-interface-guidelines](https://github.com/vercel-labs/web-interface-guidelines) |

skills.sh / Agent Skills 市场上的「web-design-guidelines」类包，若内容来自上述仓库，**规则条文应以 `command.md` 为准**；市场里可能只是打包方式不同。若市场包与 `command.md` 冲突，优先信 **GitHub main 上的 `command.md`**。

## 本仓库为何不完全等于官方原文

- **`reference.md`**：从 `command.md` 的 `## Rules`～`## Output Format` 整理而来，并 **补全** 上游在传播时被剥掉的 HTML/组件占位（如 `button`、`label`），并加了 **Vue / Element Plus** 的对应说明。  
  → 与官方 **语义应对齐**；**措辞与条目顺序**应尽量与 `command.md` 同步，**Vue 补句**属于本地增量，合并时保留即可。

- **`SKILL.md`**：Cursor Agent 技能入口，格式受 Cursor 要求约束（`name` / `description`），**不是** Vercel 仓库里的文件，无需与官方任意文件逐字一致。

## 建议的同步节奏

- **发版前 / 每季度**：拉取最新 `command.md`，与 `reference.md` 做 diff，合并新增或修改的条款。
- **发现官方大更新时**（changelog、推文、你关心的 a11y 争议）：同上。

## 操作步骤（手动）

1. 打开或下载官方 `command.md`：  
   https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md  
2. 复制其中 **`# Web Interface Guidelines` 之后、`## Output Format` 及示例** 整块规则（与当前 `reference.md` 结构对应的部分）。
3. 用 diff 工具对比本目录 **`reference.md`**：
   - 官方新增/删改的规则 → **合并进 `reference.md`**；
   - 本文件中 **「Vue / Element」**、**补全标签名** 的句子 → **保留**，除非官方已用更清晰表述覆盖。
4. （可选）用 GitHub 对比 main 上一次的 commit，把 **commit SHA** 记在下方「锚定记录」，便于以后追溯。

## 锚定记录（维护者更新）

在每次对照官方合并后更新：

- **对照日期**：YYYY-MM-DD
- **上游 commit**（`command.md` 所在）：`________________`（可到 GitHub 仓库点 `command.md` → History → 复制 SHA）

## 若仍担心不一致

- 审查时让 Agent **先 `WebFetch` 拉一次当前 `command.md`**，再以 **`reference.md` 为默认**、以 **刚拉取的官方正文** 为补充（双重对照）。  
  可在对话里明确要求：「规则以官方 raw command.md 当天内容为准，`reference.md` 仅作离线备份」。
