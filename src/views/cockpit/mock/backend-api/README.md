## 驾驶舱接口契约（Mock / 联调）

父级 API（与网关一致）：`/api/v1/datacenter/analysis/cockpit/*`

| 文件 | 接口 | 说明 |
| --- | --- | --- |
| `01-today-summary-cards.json` | `POST /api/v1/datacenter/analysis/cockpit/today-summary-cards` | 今日 Tab 专属：四卡片汇总（广告收入/广告支出/买量用户/ROI）。 |
| `02-yesterday-summary-panel.json` | `POST /api/v1/datacenter/analysis/cockpit/yesterday-summary-panel` | 昨日 Tab 专属：汇总面板（广告支出汇总/代投汇总/代投明细/应用汇总等分组）。 |

> 说明：驾驶舱顶栏同构下拉（`GET .../analysis/cockpit/meta-filter-options`）为全局复用能力，本模块不重复建契约 JSON。
