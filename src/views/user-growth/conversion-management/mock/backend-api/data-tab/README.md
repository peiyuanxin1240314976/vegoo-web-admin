# 转化管理 · Data Tab 接口（拆分）

父级路径：`POST ${ANALYSIS_API_BASE}/user-growth/conversion-management/data-tab/<endpoint>`

与路由 `/user-growth/conversion-management` 的 **data Tab** 对应；原单体 `10-data-tab` 已拆为下列 **3** 个接口，**请求体（筛选）一致**，便于首屏并行请求与缓存。

| 文件                   | endpoint（POST）            | 说明                                     |
| ---------------------- | --------------------------- | ---------------------------------------- |
| `01-overview-kpi.json` | `.../data-tab/overview-kpi` | 顶部 KPI 四块                            |
| `02-table-rows.json`   | `.../data-tab/table-rows`   | 三层树表主数据                           |
| `03-side-panels.json`  | `.../data-tab/side-panels`  | 右侧面板（类型分布/Top10/趋势/账户占比） |

**筛选入参**（各 JSON `fieldDescription.request` 一致）：`startDate`、`endDate`、`platform`、`appId`、`source`/`adPlatform`、`conversionType`；空字符串表示全部；详见根目录 `backend-api/README.md` 第四节与 `backend-fields.mdc`「接口请求 · 应用筛选（appId）」。

**页面独有「转化类型」筛选项**（下拉数据源）：根目录 `08-meta-conversion-type-options.json`（`.../meta-conversion-type-options`），**不是**本目录文件。
