# 收入概览 — 接口清单

## 父级 API 路径

与路由 `/business-insight/revenue-overview` 对齐，建议网关前缀：

`POST /api/business-insight/revenue-overview/<分组>/<endpoint>`

具体 URL 以各契约 JSON 的 `api.url` 为准；若网关与示例路径不一致，请在对应 JSON 的 `_comment` 或本文件注明。

## 接口表（P0）

| 模块 | 契约文件 | 说明 |
| --- | --- | --- |
| KPI 卡片 | `01-overview-kpi-cards.json` | 顶部 6 张 KPI（含 spark） |
| IAA 构成 | `02-overview-iaa-breakdown.json` | 广告类型 / 广告平台 / 广告位 / 国家 / 版本 |
| IAP 分析 | `03-overview-iap-breakdown.json` | 商品构成、广告平台占比、趋势序列与 KPI |
| 7 天趋势 | `04-overview-trend-7d.json` | 近 7 天 IAA vs IAP |
| ECPM 趋势 | `05-overview-ecpm-7d.json` | 预估 vs 真实 eCPM |
| 广告平台分布 | `06-overview-platform-distribution.json` | 饼图与列表 |
| Top 国家 | `07-overview-top-countries.json` | Top5 国家收入 |
| AI 洞察 | `08-overview-ai-insight.json` | 文案建议 |
| 质量指标 | `09-overview-quality-metrics.json` | 收入质量卡片 |

## 拆分原则

按 **UI 区块** 拆接口，避免单一 payload 过大；筛选参数在各契约 `fieldDescription.request` 中统一为 `t_date`、`s_app_id`、`platform`、`s_country_code`、`app_version`。
