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

### 请求体与数据字典（摘要）

- 应用：`appIds`（`string[]`）；「全部」为 `[]`（单选 0～1 个 id）
- 国家：`countryCode`（ISO 3166-1 alpha-2 **小写**）；「全部」为 `""`
- 支付平台：`paymentPlatform`（`string`）；「全部」为 `""`
- 日期：`startDate` / `endDate`，格式 `YYYY-MM-DD`
- 对比期：`compareType`，枚举见契约 `fieldDescription`

### 契约 JSON 要求

- 业务字段键名 **camelCase**，禁止下划线（见 `backend-fields.mdc`）
- 根级含 `interaction`，说明页面触发时机与默认选中（见 `api-contract-and-mock-conventions.mdc`）
