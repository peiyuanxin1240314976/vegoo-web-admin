## 我的绩效 - backend-api 契约

### 父级 API 路径（建议）

`/api/user-growth/my-performance`

### 接口清单

| 文件 | 说明 | 建议 URL | 方法 | 优先级 |
| --- | --- | --- | --- | --- |
| `01-meta-person-options.json` | 人员下拉/默认人员 | `/meta-person-options` | GET | P0 |
| `02-meta-period-options.json` | 统计口径（季度/月度）可选项 | `/meta-period-options` | GET | P0 |
| `03-overview-kpi.json` | 顶部 KPI 行（随口径变化） | `/overview-kpi` | POST | P0 |
| `04-kpi-achievement.json` | KPI 达成（圆环 + 明细） | `/kpi-achievement` | POST | P0 |
| `05-roi-trend.json` | ROI 趋势（近 3 周） | `/roi-trend` | POST | P0 |
| `06-spend-progress.json` | 消耗进度 | `/spend-progress` | POST | P0 |
| `07-app-dimension-table.json` | 应用维度绩效评估表 | `/app-dimension-table` | POST | P0 |
| `08-performance-history.json` | 绩效历史（时间轴） | `/performance-history` | POST | P0 |

### 说明

- 字段命名遵循项目数据字典：终端平台使用 `platform`，广告平台使用 `source`。
- 页面“季度/月份”为二选一口径：除 meta 类 GET 外，其它接口统一使用 `personId + periodType + periodValue` 作为过滤条件。
- `periodValue` 取值格式建议：
  - 月度：`YYYY-MM`（如 `2026-03`）
  - 季度：`YYYY-QN`（如 `2026-Q1`）
- 列表排序约定：
  - `performance-history`：按时间正序（旧 → 新），便于时间轴展示；当前高亮项由前端选择最后一项或按 `activePeriod` 指定。
  - `app-dimension-table`：顶层应用行可按业务排序；子级广告平台行建议保持稳定顺序（例如 Google/Facebook/全部）。
