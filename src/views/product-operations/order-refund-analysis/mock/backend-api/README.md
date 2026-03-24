## 订单退款分析 - backend-api 契约

### 父级 API 路径（建议）

`/api/product-operations/order-refund-analysis`

对应路由：`/product-operations/order-refund-analysis`。

### 接口清单

| 文件 | 说明 | 建议 URL | 方法 | 优先级 |
| --- | --- | --- | --- | --- |
| `01-dashboard.json` | 看板聚合：KPI、趋势、原因、国家、订单明细、预警文案 | `/overview/dashboard` | POST | P0 |

### 拆分原则

- 当前页面为单屏看板，先使用 **一个聚合接口**；若后续 payload 过大，再按 KPI / 趋势 / 表格等拆分。

### 字段与数据字典

- 支付平台请求字段：`payment_platform`（与页面「支付平台」筛选项对应）
- 国家：`country`（`all` 或 ISO 3166-1 alpha-2）
- 日期：`startDate` / `endDate`，格式 `YYYY-MM-DD`
