## 实时数据 - backend-api 契约

### 父级 API 路径（建议）

`/api/user-growth/real-time-data`

对应路由：`/user-growth/real-time-data`（`src/router/modules/user-growth.ts`）。

### 接口清单

| 文件 | 说明 | 建议 URL | 方法 | 优先级 |
| --- | --- | --- | --- | --- |
| `01-meta-filter-options.json` | 应用筛选、广告平台筛选等元数据 | `/meta-filter-options` | POST | P0 |
| `02-overview-kpi-summary.json` | 顶部 KPI 四卡汇总 | `/overview-kpi-summary` | POST | P0 |
| `03-table-app-cards.json` | 应用卡片栅格（火花图等，**不含**详情大对象） | `/table/app-cards` | POST | P0 |
| `04-app-detail.json` | 点击卡片后的详情弹窗 | `/app-detail` | POST | P0 |
| `05-overview-hourly-spend-comparison.json` | 底部「实时小时消耗对比」柱状 + ROI 折线 | `/overview-hourly-spend-comparison` | POST | P0 |

### 拆分原则

- **列表与详情分离**：`03` 仅服务卡片网格，避免首屏拉全量详情；打开弹窗再请求 `04`。
- **KPI / 趋势分离**：顶部汇总与底部分时对比独立缓存与刷新。
- **筛选项独立**：`01` 可单独缓存；列表请求携带筛选条件。

### 字段与数据字典

- 应用主键：`s_app_id`（与前端展示用 `id` 映射一致即可）。
- 终端平台：`platform`（若后续卡片按 Android/iOS 区分）。
- 广告平台：`source` / `n_source`（筛选与 `channels` 行维度）。
- 花费：响应中建议使用 `cost`（USD）；当前前端 `types` 部分字段仍为 `spend`，联调时由适配层映射。
