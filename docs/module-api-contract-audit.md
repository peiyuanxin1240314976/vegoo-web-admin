# 模块接口契约整理说明

在 Cursor 中对 Agent 说 **「整理 / 梳理 / 校验某模块的接口契约」**（或「mock/backend-api 是否完整」「页面和 fetch 是否对齐」）时，应触发展开 **`.cursor/skills/module-api-contract-audit/SKILL.md`** 中的工作流。

并列规范：

- `.cursor/rules/module-api-contract-audit.mdc`（触发说明）
- `.cursor/rules/api-contract-and-mock-conventions.mdc`
- `.cursor/rules/module-api-mock-config.mdc`
- `.cursor/rules/project-conventions.mdc`「其他」节中的条目

参考实现：用户增长 **广告成效**（`src/views/user-growth/ad-performance` + `src/api/ad-performance.ts`）。

契约与本项目对齐时须满足（详见 Skill「章节 0」）：

1. **`sampleResponse` 完整**：与 `fieldDescription` 一致，可联调，禁止空壳示例。
2. **URL**：按 **路由层级 + 模块名 + 功能**（kebab-case），见路由与 `src/api` 路径对应关系。
3. **method**：**一律 POST**，请求体 JSON，与 `request.post` 一致。

大模块多页面时（Skill **章节 9～10**）：契约 **独立 JSON 全部放在模块根** `mock/backend-api/`；**仅一份** `config/data-source.ts`；开关代码须 **分块注释**；多页面用 **多组 enum + 多份 Record + 多个 `is*Mock` 方法** 区分，禁止单一巨型枚举。每个 JSON 须有根级 **`interaction`**；模块 **README** 须有 **场景 → 接口** 对照表。
