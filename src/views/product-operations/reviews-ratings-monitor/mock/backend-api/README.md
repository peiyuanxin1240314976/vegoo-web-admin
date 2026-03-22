## 评论与评分监控 - backend-api 契约

### 父级 API 路径（建议）

`/api/product-operations/reviews-ratings-monitor`

对应路由：`/product-operations/reviews-ratings-monitor`。

### 接口清单

| 文件 | 说明 | 建议 URL | 方法 | 优先级 |
| --- | --- | --- | --- | --- |
| `01-overview-summary.json` | 汇总分析 Tab：KPI、评分分布、趋势、词云等 | `/overview/summary` | POST | P0 |
| `02-table-list.json` | 明细列表 Tab：评论列表（分页） | `/table/list` | POST | P0 |
| `03-reply-action.json` | 回复评论操作 | `/reply` | POST | P0 |
| `04-auto-reply.json` | AI 自动生成回复 | `/auto-reply` | POST | P1 |
| `05-templates.json` | 回复模板列表 | `/templates` | GET | P1 |

### 拆分原则

- **汇总与明细分离**：`01` 服务汇总分析 Tab；`02` 服务明细列表 Tab。
- **操作类独立**：回复、自动生成、模板各自独立 endpoint。

### 字段与数据字典

- 应用 ID：`s_app_id` / `appId`（空或 all 表示全部）
- 终端平台：`platform`（google_play / app_store）
- 国家代码：`s_country_code` / `countryCode`（ISO 3166-1 alpha-2）
- 日期：`startDate` / `endDate`，格式 `YYYY-MM-DD`
