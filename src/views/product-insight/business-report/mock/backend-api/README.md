# 经营报告 - 接口契约清单

> **本文档交付后端团队**，后端须严格按照各 JSON 文件中 `fieldDescription` 与 `sampleResponse` 定义的字段、类型、格式进行接口开发。

## 父级 API 路径

```
/api/v1/datacenter/analysis/report/   （报告数据接口，前缀同 `config/api-base.ts`）
/api/v1/lark/            （飞书推送接口）
```

## 接口清单（新）

> 契约仅「日报 / 周报 / 月报」分组，每周期 8 个主接口（含 3 个对比模式接口）。后端按本目录 JSON 实现即可，无旧版路径/字段兼容要求。

## 第二阶段灰度收口

- `2026-04-09` 起：前端默认只走 `daily-* / weekly-* / monthly-*` 新契约。
- 旧 `01~05` 契约已删除，旧 `/report/summary` 等路径不再作为联调口径。
- 联调执行清单见 `backend-api/rollout-checklist.md`。

### 日报

| 文件 | 说明 | URL | 方法 | 优先级 |
| --- | --- | --- | --- | --- |
| `daily-00-app-list.json` | **侧栏应用列表**（与详情解耦；`appId` 传空；含 `tab`） | `/report/daily/app-list` | POST | P0 |
| `daily-01-overview.json` | 汇总（KPI + 用户指标 + ROI + 留存；**不含**侧栏 appList） | `/report/daily/overview` | POST | P0 |
| `daily-02-ad-platform.json` | 广告平台 | `/report/daily/ad-platform` | POST | P0 |
| `daily-03-by-country.json` | 分国家 | `/report/daily/by-country` | POST | P0 |
| `daily-04-platform-country.json` | 广告平台分国家 | `/report/daily/platform-country` | POST | P1 |
| `daily-05-campaigns.json` | 在投广告系列 | `/report/daily/campaigns` | POST | P1 |
| `daily-06-compare-overview.json` | 对比模式-卡片 | `/report/daily/compare-overview` | POST | P0 |
| `daily-07-compare-trends.json` | 对比模式-趋势 | `/report/daily/compare-trends` | POST | P0 |
| `daily-08-compare-metrics.json` | 对比模式-指标矩阵 | `/report/daily/compare-metrics` | POST | P0 |

### 周报

| 文件 | 说明 | URL | 方法 | 优先级 |
| --- | --- | --- | --- | --- |
| `weekly-00-app-list.json` | 侧栏应用列表 | `/report/weekly/app-list` | POST | P0 |
| `weekly-01-overview.json` | 汇总（KPI + 用户指标 + ROI + 留存；**不含**侧栏 appList） | `/report/weekly/overview` | POST | P0 |
| `weekly-02-ad-platform.json` | 广告平台 | `/report/weekly/ad-platform` | POST | P0 |
| `weekly-03-by-country.json` | 分国家 | `/report/weekly/by-country` | POST | P0 |
| `weekly-04-platform-country.json` | 广告平台分国家 | `/report/weekly/platform-country` | POST | P1 |
| `weekly-05-campaigns.json` | 在投广告系列 | `/report/weekly/campaigns` | POST | P1 |
| `weekly-06-compare-overview.json` | 对比模式-卡片 | `/report/weekly/compare-overview` | POST | P0 |
| `weekly-07-compare-trends.json` | 对比模式-趋势 | `/report/weekly/compare-trends` | POST | P0 |
| `weekly-08-compare-metrics.json` | 对比模式-指标矩阵 | `/report/weekly/compare-metrics` | POST | P0 |

### 月报

| 文件 | 说明 | URL | 方法 | 优先级 |
| --- | --- | --- | --- | --- |
| `monthly-00-app-list.json` | 侧栏应用列表 | `/report/monthly/app-list` | POST | P0 |
| `monthly-01-overview.json` | 汇总（含费用抄扣；**不含**侧栏 appList） | `/report/monthly/overview` | POST | P0 |
| `monthly-02-ad-platform.json` | 广告平台 | `/report/monthly/ad-platform` | POST | P0 |
| `monthly-03-by-country.json` | 分国家 | `/report/monthly/by-country` | POST | P0 |
| `monthly-04-platform-country.json` | 广告平台分国家 | `/report/monthly/platform-country` | POST | P1 |
| `monthly-05-campaigns.json` | 在投广告系列 | `/report/monthly/campaigns` | POST | P1 |
| `monthly-06-compare-overview.json` | 对比模式-卡片 | `/report/monthly/compare-overview` | POST | P0 |
| `monthly-07-compare-trends.json` | 对比模式-趋势 | `/report/monthly/compare-trends` | POST | P0 |
| `monthly-08-compare-metrics.json` | 对比模式-指标矩阵 | `/report/monthly/compare-metrics` | POST | P0 |

### 飞书推送

| 文件                       | 说明             | URL                 | 方法 | 优先级 |
| -------------------------- | ---------------- | ------------------- | ---- | ------ |
| `06-lark-config-get.json`  | 读取飞书推送配置 | `/lark/push-config` | GET  | P2     |
| `07-lark-config-save.json` | 保存飞书推送配置 | `/lark/push-config` | POST | P2     |
| `08-lark-push-now.json`    | 立即推送一次     | `/lark/push-now`    | POST | P2     |

## 契约使用口径（联调必读）

- 本目录每个 `*.json` 的 `sampleRequest` / `sampleResponse` 作为**业务体契约**。
- 其中 `sampleResponse` 默认表示网关返回中的 **`data` 业务体**（即前端解包后拿到的结构）。
- 网关外层包装（如 `code`、`message`、`timestamp`）可按网关统一规范返回，不在每个报告 JSON 重复展开。
- 若某接口文件明确在 `fieldDescription.response` 写了外层包装，则以该文件内说明为准。

## 通用请求体（报告数据接口）

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `startDate` | `string` | ✅ | 查询起始日期（YYYY-MM-DD） |
| `endDate` | `string` | ✅ | 查询结束日期（YYYY-MM-DD） |
| `appId` | `string` | 视接口 | **详情类**：侧栏选中「整体」传 `\"\"` 或省略；选中某应用传应用 `id`。**`app-list`**：固定传 `\"\"`\*\*。 |
| `filterAppIds` | `string[]` | ✅ | 顶栏「应用」多选；与 cockpit `appOptions.value` 一致。**`[]` 表示不限**。 |
| `platformList` | `string[]` | ✅ | 顶栏「终端平台」多选；元素同 `platformOptions.value`。**`[]` 不限**。 |
| `sourceList` | `string[]` | ✅ | 顶栏「广告平台」多选；元素同 `sourceOptions.value`（string 枚举）。**`[]` 不限**。 |
| `countryCodeList` | `string[]` | ✅ | 顶栏「国家」多选；小写 alpha-2。**`[]` 不限**。 |
| `account` | `string` | ❌ | 广告账户；不限传 `\"\"` |

> 已移除单字符串 `platform` / `source` / `countryCode`，与页面 **ElSelect multiple** 一致；后端按数组做交集/或并集由产品约定，须在接口文档注明。

### `*-00-app-list` 补充字段

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `appId` | `string` | ✅ | **必须**传 `\"\"`**（空串）**，表示拉取侧栏全量列表，与侧栏选中 `appId` 无关。 |
| `tab` | `string` | ✅ | 与页面二级 Tab 一致：`summary` / `adPlatform` / `byCountry` / `platformCountry` / `campaigns`。 |

响应业务体：`{ "items": AppListItem[] }`（见各 `*-00-app-list.json`）。

## 侧栏 `app-list` 接口设计说明（给后端）

本接口**不是**「返回全站应用主键列表」的静态目录，而是返回**在当前报表上下文下**、用于左侧导航展示的 **`items`（含整体行 + 各应用卡片及侧栏展示用指标）**。因此请求体与详情接口共用同一套**日期与顶栏筛选维度**，仅通过 `appId` 取值区分「列表模式」与「单应用详情模式」。

### 与已删除的「旧代码 / 旧响应兼容」的区别

前端已移除的兼容包括：响应备用键名 **`appList`**、详情里嵌套侧栏列表、运行时把 `appList` 归并到 **`items`** 等。**`app-list` 请求体里的 `appId`（固定 `""`）和 `account`（当前固定 `""`）不属于上述兼容**，而是**正向契约**：与详情接口**同一套 POST 字段表**、与数据字典里的广告账户维度键名 **`account`** 对齐。若后端希望 **`app-list` 不再携带**这两项，属于**新契约收窄**，需前后端同步改 `appListBody` 与本目录 JSON，而非「删掉补丁」即可单独省略。

### 为何 body 里仍要带 `appId`，且必须为 `""`？

- **详情类接口**（`overview`、`ad-platform` 等）：`appId` 表示侧栏**当前选中**的应用；`""` 表示「整体」。
- **`app-list` 接口**：约定 **`appId` 固定传空串 `""`**，语义为「拉取侧栏候选列表」，**不要**与侧栏某一行选中态混用；也**不是**顶栏「应用」多选（顶栏范围见 `filterAppIds`）。
- 这样各接口可共用同一套 POST 字段表，后端用「`appId` 是否为空 + 路径是否为 `…/app-list`」即可区分，无需为列表单独定义另一套 body 形态。

### 为何带 `account`？当前前端怎么用？

- 与项目**统一筛选维度**（数据字典中的广告账户 `account`）对齐；详情与列表请求体**键名一致**，便于网关与后端统一校验。
- **当前经营报告页无广告账户下拉**，前端对 `app-list` 与详情均**固定传 `account: ""`**（不限）。后端在空串时可**忽略**该维度；若未来顶栏增加账户筛选，同一字段可直接生效，无需再改路径。

### 列表结果受哪些参数影响？（除 `appId` 外）

| 参数 | 作用 |
| --- | --- |
| `startDate` / `endDate` | 与右侧详情同一统计区间；侧栏卡片上的收入、环比等须与此区间一致。 |
| `tab` | 与页面二级 Tab 一致，决定侧栏**次要指标口径**（如 summary 与 adPlatform 侧栏展示字段可能不同）。 |
| `filterAppIds` | 顶栏应用多选；`[]` 为不限。用于限定**参与列表与统计的应用范围**（与侧栏「点中哪一行」无关）。 |
| `platformList` / `sourceList` / `countryCodeList` | 顶栏多选；`[]` 为不限。用于与右侧详情**同一筛选口径**下列出「当前条件下 relevant 的应用」，避免侧栏一长串与右侧数据不一致。 |

**与 `filterAppIds` 的边界**：`filterAppIds` 是顶栏**范围筛选**；侧栏**当前选中**哪一行由前端状态决定，并通过**详情接口**的 `appId`（非空即某应用，`""` 即整体）传给后端。若同时存在非空 `filterAppIds` 与详情里的 `appId`，**交集 / 以谁为准**须由后端在接口文档中写死（建议与产品确认）。

## 对比模式请求体补充字段

| 参数               | 类型       | 必填 | 说明                          |
| ------------------ | ---------- | ---- | ----------------------------- |
| `appIds`           | `string[]` | ✅   | 参与对比应用列表（最多 5 个） |
| `compareEnabled`   | `boolean`  | ✅   | 是否开启对比                  |
| `compareStartDate` | `string`   | ✅   | 对比期起始日期                |
| `compareEndDate`   | `string`   | ✅   | 对比期结束日期                |

## 场景 -> 接口 -> 触发时机

| 场景 | 接口 | 触发时机 |
| --- | --- | --- |
| 侧栏应用列表 | `daily/weekly/monthly-00-app-list` | 切换**周期 / 二级 Tab / 日期 / 顶栏平台·广告平台·国家**时重拉；**不**随左侧选中应用变化 |
| 右侧详情（含汇总与各 Tab） | `*-01-overview` … `*-05-campaigns` | 侧栏列表就绪后默认「整体」拉一次；之后仅随 **选中应用（appId）** 或详情依赖的筛选变化而拉取（**不**重复拉侧栏列表） |
| 进入对比模式 | `*-06-compare-overview`、`*-07-compare-trends`、`*-08-compare-metrics` | 打开对比模式后并行加载 |
| 对比模式：日期 / 开关 / 勾选应用 / **顶栏四数组**变化 | `*-06/07/08` 三个 compare 接口 | 对比区状态与**顶栏筛选**均会触发重拉（与主报告筛选口径一致）；若产品要求对比**忽略**顶栏，需单独约定并改前端 |
| 对比模式勾选应用变化 | `*-06/07/08` 三个 compare 接口 | 勾选列表变化后重拉 |
| 飞书弹窗打开与配置回显 | `06-lark-config-get.json` | 页面初始化或打开弹窗前读取 |
| 飞书弹窗点击保存 | `07-lark-config-save.json` | 仅保存配置，不触发立即推送 |
| 飞书弹窗点击立即推送 | `08-lark-push-now.json` | 触发一次即时推送 |

## 网关响应包装（说明）

网关可统一使用以下包装；本目录大多数 `sampleResponse` 仅描述 `data` 业务体：

```json
{ "code": 0, "message": "success", "data": { ... }, "timestamp": 1742688000000 }
```

- `code = 0` 表示成功，非 0 表示错误。
- `data` 字段为各接口实际业务数据，形态见各 JSON 文件 `sampleResponse`。
- 报告类接口（`daily|weekly|monthly-*`）联调时请优先按 `sampleResponse` 的业务体结构实现字段。

## 数据格式约定

| 字段类型          | 格式                       | 示例                         |
| ----------------- | -------------------------- | ---------------------------- |
| 金额 / 指标显示值 | 预格式化字符串             | `"$152,300"`、`"78.3万"`     |
| 变化率            | `number`（非百分号字符串） | `8.4`（代表 +8.4%）          |
| 环比字符串        | 带符号字符串               | `"+8.1%"`、`"-3.2%"`         |
| 百分点（pp）      | 字符串                     | `"+2pp"`、`"0pp"`            |
| DAU 占比          | `number 0~100`             | `42.3`（用于进度条，非 0~1） |
| ROI 值            | 字符串（带 %）             | `"98%"`、`"101%"`            |
| 布尔型状态        | `'active' \| 'paused'`     | 广告系列状态                 |

> 对比趋势接口 `sampleResponse.labels` 为**真实日期标签示例**（如 `04-03`、`02-16~02-22`、`2026-04`），实际返回应按请求 `endDate` 与周期动态生成，不使用固定占位（如 `D-6` / `W0` / `M0`）。

## 字段一致性要求

- 改动 `sampleResponse` 时须同步更新 `mockData.ts` 对应数据
- 字段命名遵循 `types.ts` 定义（前端 camelCase）
- 后端返回的字段名须与 `fieldDescription.response` 完全一致
