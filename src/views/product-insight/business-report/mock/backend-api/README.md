# 经营报告 - 接口契约清单

> **本文档交付后端团队**，后端须严格按照各 JSON 文件中 `fieldDescription` 与 `sampleResponse` 定义的字段、类型、格式进行接口开发。

## 父级 API 路径

```
/api/v1/datacenter/analysis/report/   （报告数据接口，前缀同 `config/api-base.ts`）
/api/v1/lark/            （飞书推送接口）
```

## 接口清单

| 文件 | 说明 | URL | 方法 | 优先级 |
| --- | --- | --- | --- | --- |
| `01-summary.json` | 汇总表（KPI + 用户指标 + ROI + 留存 + 费用抄扣） | `/report/summary` | GET | P0 |
| `02-ad-platform.json` | 广告平台卡片列表 | `/report/ad-platform` | GET | P0 |
| `03-by-country.json` | 分国家汇总表 | `/report/by-country` | GET | P0 |
| `04-platform-country.json` | 广告平台分国家（树形结构 + 平铺两种格式） | `/report/platform-country` | GET | P1 |
| `05-campaigns.json` | 在投广告系列表 | `/report/campaigns` | GET | P1 |
| `06-lark-config-get.json` | 读取飞书推送配置 | `/lark/push-config` | GET | P2 |
| `07-lark-config-save.json` | 保存飞书推送配置 | `/lark/push-config` | POST | P2 |
| `08-lark-push-now.json` | 立即推送一次 | `/lark/push-now` | POST | P2 |

## 通用查询参数（报告数据接口 01-05）

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `period` | `'daily' \| 'weekly' \| 'monthly'` | ✅ | 报告周期 |
| `appId` | `string` | ❌ | 应用 ID；不传返回所有应用整体数据 |
| `date` | `string (ISO 日期)` | ❌ | 指定日期如 `2026-03-23`；不传取最新可用日期 |

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
