## 账户成效页 - backend-api 契约

### 父级 API 路径（建议）

`/api/user-growth/account-performance`

### 接口清单

| 文件 | 说明 | 建议 URL | 方法 | 优先级 |
| --- | --- | --- | --- | --- |
| `01-app-performance-placeholder-table.json` | 账户维度占位表（广告平台 + 账户指标） | `/app-performance-placeholder-table` | POST | P1 |
| `02-platform-performance-placeholder-table.json` | 平台维度占位表（广告平台 + 平台汇总） | `/platform-performance-placeholder-table` | POST | P1 |

### 约定说明

- 表格字段命名与含义按组件中当前字段结构生成。
- 展示值的格式（例如 `$`、`%`）在当前占位实现中由前端格式化：mock 契约中仍保留数值字段用于图表/进度条计算。
