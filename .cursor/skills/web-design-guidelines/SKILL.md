---
name: web-design-guidelines
description: >-
  Reviews UI/Vue code against Vercel Web Interface Guidelines (a11y, focus, forms, motion, typography, performance, copy).
  Use when the user asks to review UI, check accessibility, audit design or UX, or check a page against web interface best practices.
---

# Web Interface Guidelines（Cursor Skill）

基于 Vercel [web-interface-guidelines](https://github.com/vercel-labs/web-interface-guidelines) 的审查流程，**与本仓库 Vue 3 + Element Plus 技术栈兼容**（规则里的 React/JSX 示例需自行对应到 `.vue` / `El*` / `router-link` 等）。

## 必须执行的步骤

1. **阅读规则**：先读与本技能同目录下的 **`reference.md`**（由上游 `command.md` 整理，可离线使用）。
2. **阅读待审查文件**：用户给出路径或 glob 时 `read_file` 这些文件；若未指定则询问要审查哪些文件。
3. **对照规则检查**：按 `reference.md` 中分类逐项核对，Vue 项目额外关注：`ElDialog`/`Drawer` 的焦点与 `aria`、`el-button` 仅图标时的 `aria-label`、`el-input` 与 `label`/`ElFormItem` 等。
4. **输出格式**：严格遵循 `reference.md` 末尾 **Output Format**（按文件分组、`file:line`、简练、无开场白）。

## 与官方保持对应

权威条文来源、与 skills.sh 市场包的关系、定期 diff 与合并步骤见 **`UPSTREAM.md`**。  
日常审查默认读 **`reference.md`**（离线）；若要求「必须以官方当天正文为准」，可先拉取 raw `command.md` 再对照（详见 `UPSTREAM.md` 最后一节）。

## 安装说明（给维护者）

- **项目级**（当前）：`.cursor/skills/web-design-guidelines/SKILL.md`，打开本仓库即应出现在 Cursor Skills 列表。
- **用户级**：可复制整个 `web-design-guidelines` 文件夹到 `~/.cursor/skills/`（Windows 为 `C:\Users\<你>\.cursor\skills\`），使所有项目可用。
- 勿把本技能放在 `~/.cursor/skills-cursor/`，该目录由 Cursor 内置技能占用。
