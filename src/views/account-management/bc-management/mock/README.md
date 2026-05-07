# bc-management Mock 说明

本目录为路由 `src/views/account-management/bc-management/index.vue` 提供独立 Mock 资产。

## 目录

- `backend-api/`：接口契约（含字段说明、完整 sampleRequest/sampleResponse）。
- `data.ts`：BC 列表与筛选选项基础 mock 数据。
- `bc-management-api-mock.ts`：页面读写 mock 方法（列表/筛选项/增改删/导出）。

## 数据源开关

开关文件位于 `../config/data-source.ts`，按接口粒度控制 mock/remote。
