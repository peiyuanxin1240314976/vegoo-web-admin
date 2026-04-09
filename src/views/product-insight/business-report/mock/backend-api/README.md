# 经营报告 - 接口契约清单

> **本文档交付后端团队**，后端须严格按照各 JSON 文件中 `fieldDescription` 与 `sampleResponse` 定义的字段、类型、格式进行接口开发。

## 父级 API 路径

```
/api/v1/datacenter/analysis/report/   （报告数据接口，前缀同 `config/api-base.ts`）
/api/v1/lark/            （飞书推送接口）
```

## 接口清单（新）

> 新契约按「日报 / 周报 / 月报」分组，每周期 8 个主接口（含 3 个对比模式接口）。老的 `01~05` 为兼容保留，进入灰度下线窗口。

## 第二阶段灰度收口

- `2026-04-09` 起：前端默认只走 `daily-* / weekly-* / monthly-*` 新契约。
- 旧 `01~05` 契约已删除，旧 `/report/summary` 等路径不再作为联调口径。
- 联调执行清单见 `backend-api/rollout-checklist.md`。

### 日报

| 文件 | 说明 | URL | 方法 | 优先级 |
| --- | --- | --- | --- | --- |
| `daily-01-overview.json` | 汇总（KPI + 用户指标 + ROI + 留存 + appList） | `/report/daily/overview` | POST | P0 |
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
| `weekly-01-overview.json` | 汇总（KPI + 用户指标 + ROI + 留存 + appList） | `/report/weekly/overview` | POST | P0 |
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
| `monthly-01-overview.json` | 汇总（含费用抄扣） | `/report/monthly/overview` | POST | P0 |
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

## 通用请求体（报告数据接口）

| 参数          | 类型     | 必填 | 说明                       |
| ------------- | -------- | ---- | -------------------------- |
| `startDate`   | `string` | ✅   | 查询起始日期（YYYY-MM-DD） |
| `endDate`     | `string` | ✅   | 查询结束日期（YYYY-MM-DD） |
| `appId`       | `string` | ❌   | 应用 ID；全部传 `\"\"`     |
| `platform`    | `string` | ❌   | 终端平台；全部传 `\"\"`    |
| `source`      | `string` | ❌   | 广告平台；全部传 `\"\"`    |
| `countryCode` | `string` | ❌   | 国家；全部传 `\"\"`        |
| `account`     | `string` | ❌   | 账户；全部传 `\"\"`        |

## 对比模式请求体补充字段

| 参数               | 类型       | 必填 | 说明                          |
| ------------------ | ---------- | ---- | ----------------------------- |
| `appIds`           | `string[]` | ✅   | 参与对比应用列表（最多 5 个） |
| `compareEnabled`   | `boolean`  | ✅   | 是否开启对比                  |
| `compareStartDate` | `string`   | ✅   | 对比期起始日期                |
| `compareEndDate`   | `string`   | ✅   | 对比期结束日期                |

## 通用响应包装

所有接口统一使用以下格式包装：

```json
{
  "code": 0,
  "message": "success",
  "data": { ... },
  "timestamp": 1742688000000
}
```

- `code = 0` 表示成功，非 0 表示错误
- `data` 字段为各接口实际数据，见各 JSON 文件 `sampleResponse`

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

## 字段一致性要求

- 改动 `sampleResponse` 时须同步更新 `mockData.ts` 对应数据
- 字段命名遵循 `types.ts` 定义（前端 camelCase）
- 后端返回的字段名须与 `fieldDescription.response` 完全一致
