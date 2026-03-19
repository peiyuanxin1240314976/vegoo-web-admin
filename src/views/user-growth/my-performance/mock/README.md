## 我的绩效 - Mock 说明

本目录用于「用户增长 / 我的绩效」页面在接口未就绪或联调阶段的展示与开发。

### 目录结构

- `backend-api/`：接口契约（每个 JSON 对应一个接口，包含字段解释与 sampleRequest/sampleResponse）
- `api-mock/`：本地示例响应（与 `backend-api/` 的 `sampleResponse` 结构一致）
- `data.ts`：页面级数据聚合（把多个接口 mock 组装为 `MyPerformancePageData`）

### 使用方式

页面入口 `index.vue` 通过 `mock/data.ts` 获取聚合后的页面数据；当切换统计口径（季度/月度）时，重新组装数据以模拟真实请求刷新。
