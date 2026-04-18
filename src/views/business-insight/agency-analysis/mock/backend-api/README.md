# 代投分析 - 接口契约清单

## 父级 API 路径

- **业务 POST 父级**：`/api/v1/datacenter/analysis/business-insight/agency-analysis`（与 `src/api/analysis-api-base.ts` 中 `ANALYSIS_API_BASE` + `src/api/agency-analysis.ts` 的 `AGENCY_ANALYSIS_BASE` 一致）。
- **`sampleResponse`**：表示**解包后的业务体**（若网关统一 `{ code, message, data }`，则等价于 `data` 内结构）；与本目录各 JSON 一致。

## 公用顶栏 meta（cockpit · 无本模块 JSON）

| 优先级 | 说明 | URL | 契约 |
| --- | --- | --- | --- |
| P0 | 全项目同构顶栏筛选项（应用 / 终端平台 / 广告平台 / 国家等） | **`GET`** `/api/v1/datacenter/analysis/cockpit/meta-filter-options`（**无 query、无 body**） | **无 JSON** |

- **读取方式**：`useCockpitMetaFilterStore().data` / `useCockpitMetaFilterOptions().cockpitMeta`（`fetchCockpitMetaFilterOptions`）；规范锚点见 **`src/views/user-growth/paid-analysis/mock/backend-api/README.md` 附录 A** 与 Skill `module-api-contract-audit` §0.6。
- **与本页关系（现状）**：汇总 Tab 等仍通过 **`POST .../agency-analysis/meta/filter-options`**（契约 **`09-meta-filter-options.json`**）拉取 **应用 / 代投方 / 广告平台** 选项，**未**走 cockpit Store。与附录 A「同构维度勿重复 JSON」存在**部分重叠**（`appOptions`、`sourceOptions` 与 cockpit 同构）；**`agencyOptions` 为本页独有维度**。收敛建议见下文「待收敛 / 须产品确认」，**不在未授权前提下删改契约**。

## 本目录接口清单（POST + JSON body）

| 文件 | 说明 | URL（相对父级） | 方法 | 优先级 |
| --- | --- | --- | --- | --- |
| `09-meta-filter-options.json` | 顶栏筛选项（应用 / 代投方 / 广告平台） | `/meta/filter-options` | POST | P0 |
| `01-overview.json` | 顶部 KPI 概览 | `/overview` | POST | P0 |
| `10-subtab-kpi-last7.json` | 非汇总子 Tab：近 7 天 KPI 行 | `/subtab/kpi/last7` | POST | P1 |
| `11-subtab-kpi-day.json` | 非汇总子 Tab：单日 KPI 行 | `/subtab/kpi/day` | POST | P1 |
| `12-subtab-recent-summary.json` | 非汇总子 Tab：近期汇总表 | `/subtab/table/recent-summary` | POST | P1 |
| `13-subtab-account-summary.json` | 非汇总子 Tab：账户汇总表 | `/subtab/table/account-summary` | POST | P1 |
| `02-agency-summary.json` | 代投方汇总（含展开详情） | `/table/agency-summary` | POST | P0 |
| `03-campaign-table.json` | 代投广告系列明细 | `/table/campaign` | POST | P1 |
| `04-daily-comparison.json` | 逐日对比（近 7 天） | `/table/daily-comparison` | POST | P1 |
| `05-donut-spend-share.json` | 代投方消耗占比 | `/chart/donut-spend-share` | POST | P1 |
| `06-channel-distribution.json` | 渠道分布分析 | `/chart/channel-distribution` | POST | P1 |
| `07-country-top8.json` | 国家消耗分布 Top 8 | `/chart/country-top8` | POST | P1 |
| `08-spend-trend30d.json` | 代投消耗趋势（近 30 天） | `/chart/spend-trend30d` | POST | P1 |

## 场景 → 接口 → 触发时机（与实现对齐）

| 场景 | 入口 / 组件 | 接口（逻辑 URL） | 触发时机 | 备注 |
| --- | --- | --- | --- | --- |
| 顶栏下拉选项 | `AdAgencyAnalysis.vue` | `POST .../meta/filter-options` | 页面 **mounted** 时拉取一次 | 真实环境请求体为 **`{}`**（与 `fetchAgencyAnalysisMetaFilterOptions` 一致）；契约 `09` 的 `sampleRequest` 若含 `t_date` 为**文档/历史**口径，联调以 **`src/api/agency-analysis.ts`** 为准 |
| 汇总数据区（KPI + 五图） | 同上，汇总 Tab | `POST .../overview`、五个 `POST .../chart/*` | **meta 成功后首屏自动**拉取一次；**改筛选项后**需用户点击 **「查询」** 再拉 | 与 `AgencyAnalysisFilterQuery` 一致；空数组/空 series 时 UI 应空态不白屏 |
| 非汇总子 Tab | `AdAgencyAnalysis.vue` → `AgencySubTabPerformanceMock.vue` | `POST .../subtab/kpi/last7`、`POST .../subtab/kpi/day`、`POST .../subtab/table/recent-summary`、`POST .../subtab/table/account-summary` | **切换后三个 Tab 自动并行请求** | **近期汇总**：`startDate/endDate` 固定为应用当前业务日往前 **3 天**（不使用汇总筛选日期）；**账户汇总**：默认仍跟随汇总筛选区间，且支持区块内独立查询 |
| 公用 cockpit 顶栏 | 若未来改为读 Store | **`GET .../cockpit/meta-filter-options`** | 守卫预载 + 会话 | **无本目录 JSON**；见上表 |

## 数据源开关

`src/views/business-insight/agency-analysis/config/data-source.ts`（`AgencyAnalysisEndpoint` 与 `AGENCY_ANALYSIS_USE_MOCK`）与 `src/api/agency-analysis.ts` 中 `isAgencyAnalysisMock` **一一对应**。

## 契约维护缺口（整理结论，非自动改代码）

1. **根级 `interaction`**：本目录各 `*.json` 当前**均无** Skill 要求的根级 `interaction`（`triggers` / `defaultSelection` 等）；联调说明依赖本 README 与代码。
2. **与 `backend-fields.mdc` 对齐**：契约与 `overviewBody` / `rangeBody` 仍含 **`s_app_id`、`t_date`、`t_start_date`、`t_end_date`** 等；字典要求新契约为 **`appId`、`startDate`、`endDate`** 等 camelCase。**迁移项**须在交付物与后端联调计划中单列（冻结目录内**仅建议、不擅自批量改名**）。
3. **「仅有 `fetch*`、当前无 UI 调用」**：`fetchAgencyAnalysisAgencySummary`、`fetchAgencyAnalysisCampaignTable`、`fetchAgencyAnalysisDailyComparison` 对应 **`02`～`04`** 契约与 mock 函数——**疑似预留**；是否下线或接子 Tab **须产品 / 需求确认**。
4. **cockpit 与 `09` 重叠**：若产品确认顶栏应用/广告平台与驾驶舱同源，可收敛为 **cockpit Store + 仅代投方维度独立接口**（或合并进单一 meta 契约但去掉与 cockpit 重复的 options 块）。

## 说明

- `backend-api/*.json` 为接口契约源文件；`mock/mock-data.ts` 在走 Mock 时应与 `sampleResponse` 语义一致。
- **以前端实际请求为准**：`api.url` / `sampleRequest` 与 `src/api/agency-analysis.ts` 不一致时，**以 `src/api` 为准**，并应回头修正契约文档。
