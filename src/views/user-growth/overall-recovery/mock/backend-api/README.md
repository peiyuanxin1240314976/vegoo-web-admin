# 整体回收 — 接口清单（backend-api）

## 父级路径

与路由 `/user-growth/overall-recovery` 对齐：**`/api/user-growth/overall-recovery`**

约定：**POST**，请求体 JSON；筛选「全部」字段用 **空字符串 `''`**。

## 接口表

| 优先级 | 说明 | URL（POST） | 契约文件 |
| --- | --- | --- | --- |
| P0 | 筛选下拉（应用 / 广告平台 / 国家） | `/api/user-growth/overall-recovery/meta-filter-options` | `01-meta-filter-options.json` |
| P0 | Tab1 整体回收（KPI + 曲线 + 日均量 + ROI 对比 + 明细表） | `/api/user-growth/overall-recovery/overall-tab` | `02-overall-tab.json` |
| P0 | Tab2 自然量分析（KPI + 趋势 + 来源 + 雷达 + K-factor + Top8） | `/api/user-growth/overall-recovery/organic-tab` | `03-organic-tab.json` |

## 请求字段对照（overall-tab / organic-tab）

| 前端字段                  | 含义                                      |
| ------------------------- | ----------------------------------------- |
| `date_start` / `date_end` | 统计区间 YYYY-MM-DD                       |
| `s_app_id`                | 应用 ID；`''` 表示全部                    |
| `source`                  | 广告平台（项目约定字段名）；`''` 表示全部 |
| `s_country_code`          | 国家代码；`''` 表示全部                   |

与 `OverallRecoveryFilterState`（`types.ts`）一致，注意字段名为 `source`（非 `channel`）。
