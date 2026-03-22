## 我的绩效 - Mock 说明

本目录用于「用户增长 / 我的绩效」页面在接口未就绪或联调阶段的展示与开发。

数据源开关见 [`../config/data-source.ts`](../config/data-source.ts)，与 `backend-api` 各接口一一对应。

### 目录结构

- `backend-api/`：接口契约（每个 JSON 对应一个接口，包含字段解释与 sampleRequest/sampleResponse）
- `api-mock/`：本地示例响应（与 `backend-api/` 的 `sampleResponse` 结构一致）
- `data.ts`：页面级数据聚合（把多个接口 mock 组装为 `MyPerformancePageData`）

### 使用方式

页面入口 `index.vue` 通过 `@/api/my-performance` 与各接口 `fetch*` 拉取数据；`config/data-source.ts` 为 `true` 时由本目录 `my-performance-api-mock.ts` 按接口分片返回，逻辑上仍复用 `data.ts` / `api-mock` 的示例结构。切换人员或统计口径时会重新请求对应接口。
