## 广告成效 - Mock 说明

本目录含：列表页 `data.ts`、子路由静态数据 **`campaign-detail-data.ts` / `ad-detail-data.ts` / `ad-edit-data.ts`**、契约 [`backend-api/`](./backend-api/README.md)、`ad-performance-api-mock.ts`。

数据源开关见 [`../config/data-source.ts`](../config/data-source.ts)（主列表 9 项；系列详情 6 项含操作；广告详情 1 项；编辑页 3 项），与 `src/api/ad-performance.ts` 中 `fetch*` 一一对应。

**所有接口契约 JSON** 均在 `backend-api/`（`01`～`16` 等）。不在子路由下再建 `mock/` 目录。
