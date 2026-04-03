# 付费分析（Paid Analysis）Mock 说明

- **路由**：`/user-growth/paid-analysis`，入口组件 `IAPAnalysis.vue`。
- **契约**：业务接口见 **`backend-api/` 根目录**下各 `*.json`（**无子文件夹**；文件名约定见 **`backend-api/README.md`**），与 **`src/api/user-growth/paid-analysis.ts`** 中各 `fetch*` 对应；**公用顶栏**见 **`backend-api/README.md` 附录 A**、`src/api/cockpit-meta-filter.ts`。
- **数据源开关**：`../config/data-source.ts`，按接口粒度切换 Mock / 远程（接后端后实现 Mock 分支）。
- **当前实现**：Tab 内仍为组件内静态示例数据；契约描述的是联调目标形态，便于后续替换为真实请求。
