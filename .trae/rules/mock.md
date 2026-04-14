---
alwaysApply: false
description:
---

# 组件与 API Mock 全链路联调落地规范

本规范旨在解决“大杂烩接口”、“顶层组件大包大揽请求导致性能卡顿与 loading 混乱”、“Mock 开关难以精细控制”等常见问题。

在对任何复杂页面（如多列布局、多 Tab 切换、包含独立概览模块等）进行开发与接口对接时，**必须严格遵循以下全链路闭环流程**。

## 1. 契约定义：按 UI 边界进行细粒度拆解 (Fine-grained Endpoints)

**禁止**设计“一口气返回整页所有数据”的巨型 API。接口的设计必须与 UI 的物理/逻辑边界严密对齐。

- **拆解原则**：

  - **列表与详情拆分**：左侧列表（List）与主体详情必须分离。
  - **Tab 按需拆分**：如果中间区域有多个 Tab（如“功能权限”、“数据权限”），绝不能在一个接口中返回所有 Tab 的数据，必须按 Tab 拆分为 `.../tab-a`、`.../tab-b`。
  - **摘要/概览独立**：页面右上角或顶部的概览统计（Summary/KPI）通常只需极少量的聚合数据，必须单独提供接口（如 `.../summary`），防止混入巨大的主体 Payload 中阻塞渲染。

- **契约产出物**：在 `src/views/<模块>/<页面>/mock/backend-api/` 下，为每个拆解后的 Endpoint 建立独立的 `.json` 契约文件。

## 2. 数据源配置：一接口一开关 (Independent Mock Switches)

**禁止**在根目录 `.env` 或使用全局单一变量控制整个业务模块的 Mock/Remote 状态。必须在页面子业务模块内部建立专属的配置表。

- **标准做法**：在 `src/views/<模块>/<页面>/config/data-source.ts` 中：
  1. 使用 TypeScript `enum` 列出该页面所有的拆分端点（Endpoint）。
  2. 使用 `Record<Endpoint, boolean>` 定义每个接口独立的 Mock 开关。
  3. 提供 `isEndpointMock(endpoint)` 的查询工具函数。

```typescript
// 示例
export enum DemoEndpoint {
  LIST = 'list',
  TAB_FUNC = 'tabFunc',
  TAB_DATA = 'tabData',
  SUMMARY = 'summary'
}
export const DemoMockConfig: Record<DemoEndpoint, boolean> = {
  [DemoEndpoint.LIST]: true,
  [DemoEndpoint.TAB_FUNC]: true,
  [DemoEndpoint.TAB_DATA]: false, // 允许单独将某个接口切为真实远端方便联调
  [DemoEndpoint.SUMMARY]: true
}
```

## 3. 接口层：与开关强绑定

在 `src/api/<模块>/<子文件>.ts` 中，为每个契约编写 `fetch*` 请求封装。 **强制要求**：在每个方法内部的第一行，必须根据 `data-source.ts` 中的开关判断，决定是 `return Promise.resolve(mockData)` 还是 `return request.post(...)`。

## 4. 组件层：请求下放与局部 Loading (Local Data Fetching & Loading)

**禁止**在顶层父组件（如 `index.vue`）中集中拉取所有子组件的数据并向下 Props 透传（除非数据存在极强的跨组件共享依赖）。

- **按需获取 (Lazy/Local Fetch)**：

  - 如果数据只在特定的 Tab 或特定的子组件（如 `Panel`）中展示，**必须将数据拉取逻辑（API 调用）下放到该子组件内部**。
  - 父组件仅需传递上下文参数（如当前的 `id` 或选中的实体对象）。
  - **子模块切换防漏**：在具有多个子模块或 Tab 切换的页面中，务必检查切换逻辑（通常使用 `watch` 监听父级透传的 `id` 变化），确保在切换时触发数据的重新拉取。

- **局部骨架与 Loading**：
  - 每个独立发起请求的子组件，必须内部维护一个 `loading = ref(false)` 状态。
  - 并在其顶层 DOM 节点上使用 `v-loading="loading"`（或其他局部骨架屏组件）。
  - 这样即使某一个 Tab 数据缓慢，也不会导致整个页面出现卡顿或大面积白屏，真正做到**“谁请求，谁加载，谁兜底”**。

## 5. 空态与异常兜底

- 在 `watch` 监听或 `loadData` 函数中，若 `id` 不存在或接口抛出 `catch` 异常，组件内部必须将自身数据状态重置为空数组 `[]` 或 null。
- 契约设计阶段也必须明确“接口无数据时返回空数组”的要求，确保前端直接遍历也不会引发崩溃。

---

> 总结公式：UI 模块拆解 = 契约 JSON 拆解 = 枚举开关独立 = 局部组件 watch 触发 API = 局部 v-loading 体验闭环。
