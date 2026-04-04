# 整体回收 — 接口清单（backend-api）

## 父级路径

与路由 `/user-growth/overall-recovery` 对齐：**`/api/user-growth/overall-recovery`**

约定：**POST**，请求体 JSON；筛选「全部」字段用 **空字符串 `''`**（与 `backend-fields.mdc`「接口请求 · 筛选「全部」」一致）。

## 顶栏筛选项（无本目录 JSON）

与 **`CockpitMetaFilterOptionsData`** 同构的应用 / 广告平台 / 国家下拉：**不**使用本模块 `meta-filter-options` 接口。

- **HTTP**：**`GET`** `${ANALYSIS_API_BASE}/cockpit/meta-filter-options`（无参），`fetchCockpitMetaFilterOptions`
- **页面**：读 **`useCockpitMetaFilterStore().data`**（或 `useCockpitMetaFilterOptions().cockpitMeta`），见 **`src/views/user-growth/paid-analysis/mock/backend-api/README.md` 附录 A**

## Tab1 / Tab2 公共请求体（本页顶栏实际维度）

与 `backend-fields.mdc` 统一键名一致（**camelCase**），**仅包含本页有的筛选项**：统计周期 + 应用 + 广告平台 + 国家（无终端平台、无广告账户筛选，契约与 POST body **不出现** `platform`、`account`）。

| 字段                    | 说明                               |
| ----------------------- | ---------------------------------- |
| `startDate` / `endDate` | 统计区间 YYYY-MM-DD（含）          |
| `appId`                 | 应用 ID；`''` 全部                 |
| `source`                | 广告平台（string 枚举）；`''` 全部 |
| `countryCode`           | 国家代码（小写 ISO2）；`''` 全部   |

前端由 `buildOverallRecoveryCommonBody` 从 `OverallRecoveryFilterState` 映射生成。

## 明细接口额外入参（整体回收明细数据）

**`POST .../overall-tab/detail-records`** 在公共体之上增加：

| 字段 | 说明 |
| --- | --- |
| `detailApp` | 明细卡片内「应用」子筛。UI「全部」→ `''`；否则与行上 `detailApp`、下拉 `value` 一致（如 `weather5`）。 |
| `detailChannel` | 明细卡片内「广告平台」子筛。UI「全部」→ `''`；否则如 `google`、`facebook`。 |

- 顶栏点击「检索」：与其它 Tab1 接口并行拉取明细时，`detailApp`/`detailChannel` 均为 `''`。
- 明细卡片点击「检索」：**仅**调 `detail-records`，带上当前子筛（映射后 JSON）。

## 接口表

| 优先级 | 说明 | URL（POST） | 契约文件 |
| --- | --- | --- | --- |
| P0 | Tab1 KPI 卡片 | `/api/user-growth/overall-recovery/overall-tab/kpis` | `02-overall-tab-kpis.json` |
| P0 | Tab1 整体回收曲线 | `/api/user-growth/overall-recovery/overall-tab/recovery-curve` | `02-overall-tab-recovery-curve.json` |
| P0 | Tab1 日均量构成 | `/api/user-growth/overall-recovery/overall-tab/daily-volume` | `02-overall-tab-daily-volume.json` |
| P0 | Tab1 ROI 对比表 | `/api/user-growth/overall-recovery/overall-tab/roi-compare` | `02-overall-tab-roi-compare.json` |
| P0 | Tab1 明细数据表（含子筛） | `/api/user-growth/overall-recovery/overall-tab/detail-records` | `02-overall-tab-detail-records.json` |
| P0 | Tab2 自然量分析（整 Tab 仍单接口，入参与 Tab1 公共体一致） | `/api/user-growth/overall-recovery/organic-tab` | `03-organic-tab.json` |

## 历史说明

- 原 **`POST .../overall-tab`** 单接口聚合 KPI + 曲线 + 日均量 + ROI + 明细，已拆分为上表 5 个子接口；联调请按新路径实现。
