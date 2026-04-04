# 付费分析（Paid Analysis）接口契约

## 一、URL 与约定

- **父级路径**：`${ANALYSIS_API_BASE}/user-growth/paid-analysis`，即 `/api/v1/datacenter/analysis/user-growth/paid-analysis`（与 `src/api/analysis-api-base.ts` 一致）。
- **目录结构**：**所有契约 JSON 均在本目录根下扁平存放**，**不创建子文件夹**；用 **文件名前缀**区分业务块（`02-tab-channel-*`、`03-tab-product-*`、`04`～`07` 订单明细等）。
- **方法**：本目录下 **`*.json`** 所描述接口均为 **POST**、JSON body。另有 **公用顶栏筛选项**仅在本 README **附录 A**中用 Markdown 约定（无 JSON）。
- **前端路由**：`/user-growth/paid-analysis`。
- **`sampleResponse`**：表示**解包后的业务体**（网关若统一 `{ code, message, data }`，则等价于 `data` 内结构）；全目录一致。

### 文件名约定（与网关路径对应）

| 前缀 / 文件模式        | 含义                                                         |
| ---------------------- | ------------------------------------------------------------ |
| `02-tab-channel-*`     | 广告平台 IAP 转化 Tab 拆段：`overview` / `tables` / `charts` |
| `03-tab-product-*`     | 商品分析 Tab 拆段：`overview` / `ranking` / `charts`         |
| `04-tab-order-summary` | 订单明细 Tab 汇总区（KPI + 表 + 图，不含分页列表）           |
| `05-table-order-list`  | 订单分页列表                                                 |
| `06-order-detail`      | 订单详情                                                     |
| `07-export-orders`     | 导出订单                                                     |

## 二、接口清单

| 优先级 | 说明 | URL（POST） | 契约文件（本目录根） |
| --- | --- | --- | --- |
| P0 | 顶栏筛选项 | **`.../cockpit/meta-filter-options`**（公用） | **无 JSON**（**附录 A**） |
| P0 | channel Tab · 概览 KPI + AI | `.../tab-channel/overview` | **`02-tab-channel-overview.json`** |
| P0 | channel Tab · 表格 | `.../tab-channel/tables` | **`02-tab-channel-tables.json`** |
| P0 | channel Tab · 图表 | `.../tab-channel/charts` | **`02-tab-channel-charts.json`** |
| P0 | product Tab · KPI | `.../tab-product/overview` | **`03-tab-product-overview.json`** |
| P0 | product Tab · 排行表 | `.../tab-product/ranking` | **`03-tab-product-ranking.json`** |
| P0 | product Tab · 图例与图表 | `.../tab-product/charts` | **`03-tab-product-charts.json`** |
| P0 | 订单明细 Tab · 汇总 | `.../tab-order-summary` | `04-tab-order-summary.json` |
| P0 | 订单明细 Tab · 列表 | `.../table/order-list` | `05-table-order-list.json` |
| P1 | 订单详情 | `.../order-detail` | `06-order-detail.json` |
| P2 | 导出订单 | `.../export/orders` | `07-export-orders.json` |

## 三、场景 → 接口

| 场景 | 入口 | 契约文件 | 备注 |
| --- | --- | --- | --- |
| 页面可配置筛选项 | `IAPAnalysis.vue` | **附录 A** | `fetchCockpitMetaFilterOptions` |
| 广告平台 IAP 转化 Tab + 检索 | Tab `channel` | `02-tab-channel-overview` / `tables` / `charts` 三个 JSON | 三个 `fetch*` **并行**；合并为 `PaidAnalysisChannelTabData` |
| 商品分析 Tab + 检索 | Tab `product` | `03-tab-product-overview` / `ranking` / `charts` | 三个 `fetch*` **并行**；合并为 `PaidAnalysisProductTabData`；子 Tab 交互见 **`03-tab-product-ranking.json`** 内 `interaction` |
| 订单明细 Tab + 检索 | Tab `order` | `04`、`05` | 筛选一并入 `05` |
| 订单行详情 | `IAPOrderTab.vue` | `06` | `s_order_id` |
| 导出 | 顶栏 / 订单 Tab | `07` | 占位时可无请求 |

## 四、入参日期

- 统一 **`startDate`**、**`endDate`**（`YYYY-MM-DD`）。
- 顶栏仅选单日：**`startDate` = `endDate`**。

## 五、数据源开关

见 `../../config/data-source.ts`。

---

## 附录 A：公用顶栏 `meta-filter-options`（无 JSON 契约）

- **路径**：`POST ${ANALYSIS_API_BASE}/cockpit/meta-filter-options`（与 paid-analysis 父路径无关）。
- **请求体**：可为空 `{}`。筛选「全部」等见 `backend-fields.mdc`、`api-contract-and-mock-conventions.mdc`。
- **响应**：`CockpitMetaFilterOptionsData`（`src/types/cockpit-meta-filter.ts`）— `appOptions`、`platformOptions`、`sourceOptions`、`countryOptions`；各项 `{ label, value }`，**「全部」** 对应 `""`；国家 value 为小写 ISO 3166-1 alpha-2；`sourceOptions` 与 `n_source` **string** 对齐。
- **与付费分析等业务请求对齐**：本模块等业务接口筛选体中的 **`appId`** 与 **`appOptions[].value`** 同源（UI 选「全部」提交前映射为 `""`，与 `backend-fields.mdc` 一致）。
- **封装**：`fetchCockpitMetaFilterOptions`（`src/api/cockpit-meta-filter.ts`）。
- **约定**：同构业务勿再增加 `meta-filter-options` 契约 JSON。
